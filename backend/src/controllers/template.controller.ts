import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { PlaceholderService } from '../services/placeholder.service';
import path from 'path';
import { TEMPLATES_DIR } from '../utils/paths';

export class TemplateController {
  /**
   * POST /api/templates/upload
   * Accepts template file upload (.docx), extracts placeholders, returns template metadata
   */
  public static async uploadTemplate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No template file provided or invalid file format.' });
        return;
      }

      const templateId = req.file.filename;
      const originalName = req.file.originalname;

      const templateInfo = TemplateService.getTemplateInfo(templateId, originalName);

      res.status(200).json({
        message: 'Template uploaded successfully',
        template: templateInfo,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to process template upload' });
    }
  }

  /**
   * POST /api/templates/extract
   * Extract placeholders for a specific templateId
   */
  public static async extractPlaceholders(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.body;

      if (!templateId) {
        res.status(400).json({ error: 'templateId is required' });
        return;
      }

      const filePath = path.join(TEMPLATES_DIR, templateId);
      const placeholders = PlaceholderService.extractPlaceholders(filePath);
      const textInfo = PlaceholderService.extractDocumentText(filePath);

      res.status(200).json({
        templateId,
        placeholders,
        previewText: textInfo.fullText,
        paragraphs: textInfo.paragraphs,
        blocks: textInfo.blocks,
        watermarkText: textInfo.watermarkText,
        watermarkImage: textInfo.watermarkImage,
        headerText: textInfo.headerText,
        indiaAddress: textInfo.indiaAddress,
        usaAddress: textInfo.usaAddress,
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Template not found' });
    }
  }

  /**
   * GET /api/templates
   * List uploaded templates
   */
  public static async listTemplates(_req: Request, res: Response): Promise<void> {
    try {
      const templates = TemplateService.listTemplates();
      res.status(200).json({ templates });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list templates' });
    }
  }

  /**
   * DELETE /api/templates/:id
   * Remove a template file
   */
  public static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateId = req.params.id as string;
      if (!templateId) {
        res.status(400).json({ error: 'Template ID parameter is required' });
        return;
      }

      TemplateService.deleteTemplate(templateId);
      res.status(200).json({ message: `Template '${templateId}' deleted successfully` });
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Failed to delete template' });
    }
  }
}
