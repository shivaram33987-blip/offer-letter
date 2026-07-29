import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES_DIR, GENERATED_DIR } from '../utils/paths';
import { PdfService } from './pdf.service';

export interface GenerationResult {
  docId: string;
  docxFilename: string;
  pdfFilename: string | null;
  docxUrl: string;
  pdfUrl: string | null;
  pdfError?: string;
  generatedAt: string;
}

export class DocumentService {
  /**
   * Populate a Word template with data and custom word replacements, then save generated DOCX file.
   */
  public static async generateDocx(
    templateId: string,
    data: Record<string, any>,
    customReplacements?: Record<string, string>
  ): Promise<{ docId: string; docxFilename: string; docxPath: string }> {
    const templatePath = path.join(TEMPLATES_DIR, templateId);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file '${templateId}' not found.`);
    }

    const content = fs.readFileSync(templatePath);
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // Return empty string for missing keys
    });

    // Render docxtemplater for {{placeholders}}
    doc.render(data || {});

    const renderedZip = doc.getZip();

    // Perform robust text replacements for custom word pairs
    if (customReplacements && Object.keys(customReplacements).length > 0) {
      const xmlFiles = Object.keys(renderedZip.files).filter(
        (file) => file.startsWith('word/') && file.endsWith('.xml')
      );

      for (const fileName of xmlFiles) {
        let xmlContent = renderedZip.files[fileName].asText();
        xmlContent = DocumentService.replaceInXml(xmlContent, customReplacements);
        renderedZip.file(fileName, xmlContent);
      }
    }

    const buf = renderedZip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const docId = uuidv4();
    const docxFilename = `generated_${docId}.docx`;
    const docxPath = path.join(GENERATED_DIR, docxFilename);

    fs.writeFileSync(docxPath, buf);

    return { docId, docxFilename, docxPath };
  }

  /**
   * Generate both DOCX and PDF
   */
  public static async generateDocument(
    templateId: string,
    data: Record<string, any>,
    customReplacements?: Record<string, string>
  ): Promise<GenerationResult> {
    const { docId, docxFilename, docxPath } = await this.generateDocx(templateId, data, customReplacements);

    const pdfFilename = `generated_${docId}.pdf`;
    const pdfPath = path.join(GENERATED_DIR, pdfFilename);

    let pdfGenerated = false;
    let pdfErrorMsg: string | undefined;

    try {
      await PdfService.convertDocxToPdf(docxPath, pdfPath);
      pdfGenerated = fs.existsSync(pdfPath);
    } catch (err: any) {
      console.warn('PDF conversion notice:', err.message || err);
      pdfErrorMsg = err.message || 'PDF conversion unavailable';
    }

    return {
      docId,
      docxFilename,
      pdfFilename: pdfGenerated ? pdfFilename : null,
      docxUrl: `/api/download/${docxFilename}`,
      pdfUrl: pdfGenerated ? `/api/download/${pdfFilename}` : null,
      pdfError: pdfErrorMsg,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper to safely escape XML special characters
   */
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Replaces target words in OpenXML content while strictly preserving tab stops (<w:tab/>), linebreaks, and styling
   */
  private static replaceInXml(xmlContent: string, customReplacements: Record<string, string>): string {
    // 1. Replace inside VML Watermark textpath string="..." attributes
    const textpathRegex = /(<v:textpath\s+[^>]*\bstring=["'])([^"']+)(["'])/gi;
    let modifiedXml = xmlContent.replace(textpathRegex, (_full, prefix, strVal, suffix) => {
      let updatedStr = strVal;
      for (const [targetWord, replacementVal] of Object.entries(customReplacements)) {
        if (!targetWord || !targetWord.trim()) continue;
        const regex = new RegExp(targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        updatedStr = updatedStr.replace(regex, replacementVal ?? '');
      }
      return `${prefix}${DocumentService.escapeXml(updatedStr)}${suffix}`;
    });

    // 2. Perform Tag-by-Tag Replacement (preserves <w:tab/>, <w:br/>, <w:drawing/>, styles)
    const textTagRegex = /<w:t(\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;

    modifiedXml = modifiedXml.replace(textTagRegex, (fullTag, attrs, tagText) => {
      if (!tagText) return fullTag;

      let newTagText = tagText;
      let hasChange = false;

      for (const [targetWord, replacementVal] of Object.entries(customReplacements)) {
        if (!targetWord || !targetWord.trim()) continue;
        const escapedTarget = targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTarget, 'gi');

        if (regex.test(newTagText)) {
          hasChange = true;
          newTagText = newTagText.replace(regex, replacementVal ?? '');
        }
      }

      if (hasChange) {
        return `<w:t xml:space="preserve"${attrs || ''}>${DocumentService.escapeXml(newTagText)}</w:t>`;
      }
      return fullTag;
    });

    // 3. Fallback Paragraph-level Replacement for multi-word phrases split across <w:t> tags
    const paragraphRegex = /<w:p(?:\s+[^>]*)*>([\s\S]*?)<\/w:p>/g;

    return modifiedXml.replace(paragraphRegex, (fullParagraphXml, innerXml) => {
      let paragraphNeedsReplacement = false;
      const rawTextContent = innerXml.replace(/<[^>]+>/g, '');

      for (const [targetWord] of Object.entries(customReplacements)) {
        if (!targetWord || !targetWord.trim()) continue;
        const escapedTarget = targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(escapedTarget, 'gi').test(rawTextContent)) {
          paragraphNeedsReplacement = true;
          break;
        }
      }

      if (!paragraphNeedsReplacement) return fullParagraphXml;

      // If paragraph contains <w:tab/>, preserve tabs by replacing text per run <w:r>
      if (innerXml.includes('<w:tab/>') || innerXml.includes('<w:tab')) {
        const runRegex = /<w:r(?:\s+[^>]*)*>([\s\S]*?)<\/w:r>/g;
        return fullParagraphXml.replace(runRegex, (fullRunXml, runInnerXml) => {
          if (runInnerXml.includes('<w:tab')) return fullRunXml; // Never touch tab runs!

          let runText = runInnerXml.replace(/<[^>]+>/g, '');
          if (!runText) return fullRunXml;

          let runChanged = false;
          for (const [targetWord, replacementVal] of Object.entries(customReplacements)) {
            if (!targetWord || !targetWord.trim()) continue;
            const regex = new RegExp(targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            if (regex.test(runText)) {
              runChanged = true;
              runText = runText.replace(regex, replacementVal ?? '');
            }
          }

          if (runChanged) {
            return `<w:r><w:t xml:space="preserve">${DocumentService.escapeXml(runText)}</w:t></w:r>`;
          }
          return fullRunXml;
        });
      }

      // Standard fallback for paragraphs without tabs
      const runTextRegex = /<w:t(?:\s+[^>]*)*>([\s\S]*?)<\/w:t>/g;
      let combinedText = '';
      let m: RegExpExecArray | null;

      while ((m = runTextRegex.exec(innerXml)) !== null) {
        combinedText += m[1];
      }

      if (!combinedText) return fullParagraphXml;

      let updatedText = combinedText;
      for (const [targetWord, replacementVal] of Object.entries(customReplacements)) {
        if (!targetWord || !targetWord.trim()) continue;
        const regex = new RegExp(targetWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        updatedText = updatedText.replace(regex, replacementVal ?? '');
      }

      let isFirst = true;
      const newInnerXml = innerXml.replace(runTextRegex, () => {
        if (isFirst) {
          isFirst = false;
          return `<w:t xml:space="preserve">${DocumentService.escapeXml(updatedText)}</w:t>`;
        }
        return `<w:t></w:t>`;
      });

      const pTagOpenMatch = fullParagraphXml.match(/^<w:p(?:\s+[^>]*)*>/);
      const pTagOpen = pTagOpenMatch ? pTagOpenMatch[0] : '<w:p>';
      return `${pTagOpen}${newInnerXml}</w:p>`;
    });
  }
}
