import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { PdfService } from '../services/pdf.service';
import path from 'path';
import fs from 'fs';
import { GENERATED_DIR } from '../utils/paths';

export class GenerateController {
  /**
   * POST /api/generate/docx
   * Replaces placeholders and generates DOCX file (+ attempts PDF conversion)
   */
  public static async generateDocx(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, data, customReplacements } = req.body;

      if (!templateId) {
        res.status(400).json({ error: 'templateId is required' });
        return;
      }

      const result = await DocumentService.generateDocument(templateId, data || {}, customReplacements);
      res.status(200).json({
        message: 'Document generated successfully',
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate document' });
    }
  }

  /**
   * POST /api/generate/pdf
   * Converts an existing generated DOCX to PDF or generates from template
   */
  public static async generatePdf(req: Request, res: Response): Promise<void> {
    try {
      const { docxFilename, templateId, data } = req.body;

      let targetDocxPath: string;
      let targetPdfFilename: string;

      if (docxFilename) {
        targetDocxPath = path.join(GENERATED_DIR, docxFilename);
        targetPdfFilename = docxFilename.replace('.docx', '.pdf');
      } else if (templateId) {
        const gen = await DocumentService.generateDocx(templateId, data || {});
        targetDocxPath = gen.docxPath;
        targetPdfFilename = gen.docxFilename.replace('.docx', '.pdf');
      } else {
        res.status(400).json({ error: 'Either docxFilename or templateId is required.' });
        return;
      }

      const targetPdfPath = path.join(GENERATED_DIR, targetPdfFilename);

      await PdfService.convertDocxToPdf(targetDocxPath, targetPdfPath);

      res.status(200).json({
        message: 'PDF generated successfully',
        pdfFilename: targetPdfFilename,
        pdfUrl: `/api/download/${targetPdfFilename}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to convert document to PDF' });
    }
  }
}
