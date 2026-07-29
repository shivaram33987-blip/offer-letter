import fs from 'fs';
import path from 'path';
import { TEMPLATES_DIR } from '../utils/paths';
import { PlaceholderService } from './placeholder.service';

export interface TemplateInfo {
  id: string;
  originalName: string;
  filePath: string;
  size: number;
  uploadedAt: string;
  placeholders: string[];
  previewText?: string;
  paragraphs?: string[];
  blocks?: any[];
  watermarkText?: string;
  watermarkImage?: string;
  headerText?: string;
  indiaAddress?: string;
  usaAddress?: string;
}

export class TemplateService {
  /**
   * Get metadata and extracted placeholders for a template file by ID/filename
   */
  public static getTemplateInfo(templateId: string, originalName?: string): TemplateInfo {
    const filePath = path.join(TEMPLATES_DIR, templateId);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template with ID '${templateId}' not found.`);
    }

    const stats = fs.statSync(filePath);
    const placeholders = PlaceholderService.extractPlaceholders(filePath);
    const textInfo = PlaceholderService.extractDocumentText(filePath);

    return {
      id: templateId,
      originalName: originalName || templateId,
      filePath,
      size: stats.size,
      uploadedAt: stats.birthtime.toISOString(),
      placeholders,
      previewText: textInfo.fullText,
      paragraphs: textInfo.paragraphs,
      blocks: textInfo.blocks,
      watermarkText: textInfo.watermarkText,
      watermarkImage: textInfo.watermarkImage,
      headerText: textInfo.headerText,
      indiaAddress: textInfo.indiaAddress,
      usaAddress: textInfo.usaAddress,
    };
  }

  /**
   * List all stored templates
   */
  public static listTemplates(): Partial<TemplateInfo>[] {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      return [];
    }

    const files = fs.readdirSync(TEMPLATES_DIR);
    return files
      .filter((file) => file.endsWith('.docx'))
      .map((file) => {
        const filePath = path.join(TEMPLATES_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          id: file,
          originalName: file,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
        };
      });
  }

  /**
   * Delete a template file by ID/filename
   */
  public static deleteTemplate(templateId: string): void {
    const filePath = path.join(TEMPLATES_DIR, templateId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      throw new Error(`Template '${templateId}' not found.`);
    }
  }
}
