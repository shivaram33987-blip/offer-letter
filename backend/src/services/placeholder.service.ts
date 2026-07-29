import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';

export interface DocumentBlock {
  type: 'paragraph' | 'table';
  text?: string;
  rows?: string[][];
  image?: string; // Base64 data URL for inline signatures/images
}

export interface DocumentTextExtraction {
  fullText: string;
  paragraphs: string[];
  blocks?: DocumentBlock[];
  watermarkText?: string;
  watermarkImage?: string;
  headerText?: string;
  footerText?: string;
  indiaAddress?: string;
  usaAddress?: string;
}

export class PlaceholderService {
  /**
   * Extract placeholders from a .docx file buffer or file path.
   * Matches {{variableName}} patterns in the XML text content of body, headers, and footers.
   */
  public static extractPlaceholders(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found at: ${filePath}`);
    }

    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);

    const placeholdersSet = new Set<string>();

    const filesToInspect = Object.keys(zip.files).filter((fileName) =>
      fileName.startsWith('word/') && fileName.endsWith('.xml')
    );

    const placeholderRegex = /\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g;

    for (const fileName of filesToInspect) {
      const xmlContent = zip.files[fileName].asText();
      const cleanText = xmlContent.replace(/<[^>]+>/g, '');

      let match: RegExpExecArray | null;
      while ((match = placeholderRegex.exec(cleanText)) !== null) {
        if (match[1]) {
          const varName = match[1].trim();
          const cleanVar = varName.replace(/^[\/#^@]/, '').trim();
          if (cleanVar) {
            placeholdersSet.add(cleanVar);
          }
        }
      }
    }

    return Array.from(placeholdersSet);
  }

  /**
   * Extract readable blocks (paragraphs, tables, signatures & images), watermark image, watermark text, header text, and footer office addresses from a .docx file.
   */
  public static extractDocumentText(filePath: string): DocumentTextExtraction {
    if (!fs.existsSync(filePath)) {
      return { fullText: '', paragraphs: [], blocks: [] };
    }

    try {
      const content = fs.readFileSync(filePath);
      const zip = new PizZip(content);

      const documentXml = zip.files['word/document.xml']?.asText() || '';

      let watermarkText: string | undefined;
      let watermarkImage: string | undefined;
      let headerText: string | undefined;

      // 1. Inspect Header XML files and Relationship files for Watermark / Logo Image or VML Text
      const headerFiles = Object.keys(zip.files).filter(
        (file) => file.startsWith('word/header') && file.endsWith('.xml')
      );

      for (const headerFile of headerFiles) {
        const headerXml = zip.files[headerFile]?.asText() || '';
        const relsFile = `word/_rels/${path.basename(headerFile)}.rels`;
        const relsXml = zip.files[relsFile]?.asText() || '';

        // Check VML Textpath Watermark
        const textpathMatch = /<v:textpath\s+[^>]*\bstring=["']([^"']+)["']/i.exec(headerXml);
        if (textpathMatch && textpathMatch[1]) {
          const candidate = textpathMatch[1].trim();
          if (candidate && !/^\d+$/.test(candidate)) {
            watermarkText = candidate;
          }
        }

        // Check Image Relationships in Header
        const imageRelMatch = /<Relationship\s+[^>]*\bId=["']([^"']+)["'][^>]*\bTarget=["']([^"']+)["']/gi;
        let relMatch: RegExpExecArray | null;

        while ((relMatch = imageRelMatch.exec(relsXml)) !== null) {
          const target = relMatch[2];

          if (target && target.includes('media/')) {
            const mediaPath = target.startsWith('word/')
              ? target
              : `word/${target.replace(/^..\//, '')}`;
            const imageFileInZip = zip.files[mediaPath];

            if (imageFileInZip) {
              const imgBuf = imageFileInZip.asNodeBuffer();
              const ext = path.extname(target).toLowerCase();
              let mimeType = 'image/png';
              if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

              watermarkImage = `data:${mimeType};base64,${imgBuf.toString('base64')}`;
              break;
            }
          }
        }

        const cleanHeaderStr = headerXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanHeaderStr && !/^\d+$/.test(cleanHeaderStr) && !headerText) {
          headerText = cleanHeaderStr;
        }
      }

      // 2. Read document.xml.rels for inline images (e.g. signature image)
      const docRelsXml = zip.files['word/_rels/document.xml.rels']?.asText() || '';
      const docImageRels: Record<string, string> = {};

      const relMatchRegex = /<Relationship\s+[^>]*\bId=["']([^"']+)["'][^>]*\bTarget=["']([^"']+)["']/gi;
      let relm: RegExpExecArray | null;

      while ((relm = relMatchRegex.exec(docRelsXml)) !== null) {
        const rId = relm[1];
        const target = relm[2];
        if (target && target.includes('media/')) {
          docImageRels[rId] = target.startsWith('word/') ? target : `word/${target.replace(/^..\//, '')}`;
        }
      }

      // 3. Inspect Footer XML files for Registered Office Addresses (India & USA)
      const footerFiles = Object.keys(zip.files).filter(
        (file) => file.startsWith('word/footer') && file.endsWith('.xml')
      );

      let footerText: string | undefined;
      let indiaAddress: string | undefined =
        'INDIA: 2-27-163, Gandhi Nagar, Wanaparthy, Telangana, India 509103. Phone no.: (+91) 8790946714';
      let usaAddress: string | undefined =
        'USA: 5 Green-tree Centre, Dr 525, Route 73, STE 104, Burlington City, New Jersey 08053. Phone no.: +1 646-741-8264';

      for (const footerFile of footerFiles) {
        const footerXml = zip.files[footerFile]?.asText() || '';
        const cleanFooterStr = footerXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        if (cleanFooterStr) {
          footerText = cleanFooterStr;
        }
      }

      // 4. Extract Document Body Paragraphs, Tables & Inline Signature Images
      const bodyMatch = documentXml.match(/<w:body[\s\S]*?<\/w:body>/);
      const bodyXml = bodyMatch ? bodyMatch[0] : documentXml;

      const elementRegex = /<(w:p|w:tbl)(?:\s+[^>]*)*>[\s\S]*?<\/\1>/g;
      const blocks: DocumentBlock[] = [];
      const paragraphs: string[] = [];

      let match: RegExpExecArray | null;
      while ((match = elementRegex.exec(bodyXml)) !== null) {
        const tag = match[1];
        const blockXml = match[0];

        if (tag === 'w:tbl') {
          const rows: string[][] = [];
          const rowMatches = blockXml.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];

          for (const rXml of rowMatches) {
            const cellMatches = rXml.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
            const cells = cellMatches.map((c) => c.replace(/<[^>]+>/g, '').trim());

            if (cells.some((c) => c.length > 0)) {
              rows.push(cells);
            }
          }

          if (rows.length > 0) {
            blocks.push({ type: 'table', rows });
          }
        } else {
          // Check for inline signature/image blip reference
          let inlineImageBase64: string | undefined;
          const blipMatch = /r:embed=["']([^"']+)["']/i.exec(blockXml);

          if (blipMatch && blipMatch[1]) {
            const rId = blipMatch[1];
            const mediaPath = docImageRels[rId];
            if (mediaPath && zip.files[mediaPath]) {
              const imgBuf = zip.files[mediaPath].asNodeBuffer();
              const ext = path.extname(mediaPath).toLowerCase();
              let mimeType = 'image/jpeg';
              if (ext === '.png') mimeType = 'image/png';

              // Only include inline images (skip giant background watermark images which are >50KB)
              if (imgBuf.length < 50000) {
                inlineImageBase64 = `data:${mimeType};base64,${imgBuf.toString('base64')}`;
              }
            }
          }

          let text = blockXml.replace(/<[^>]+>/g, '').trim();
          if (text === 'Signature:Date:' || text === 'Signature: Date:' || /^Signature:?\s*Date:?/i.test(text)) {
            text = '';
          }

          if (text || inlineImageBase64) {
            if (text && !/^\d{10,}$/.test(text)) {
              paragraphs.push(text);
            }
            blocks.push({
              type: 'paragraph',
              text: text && !/^\d{10,}$/.test(text) ? text : undefined,
              image: inlineImageBase64,
            });
          }
        }
      }

      return {
        fullText: paragraphs.join('\n\n'),
        paragraphs,
        blocks,
        watermarkText,
        watermarkImage,
        headerText,
        footerText,
        indiaAddress,
        usaAddress,
      };
    } catch (err) {
      console.warn('Failed to extract document text preview:', err);
      return { fullText: '', paragraphs: [], blocks: [] };
    }
  }
}
