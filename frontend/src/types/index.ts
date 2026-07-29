export interface DocumentBlock {
  type: 'paragraph' | 'table';
  text?: string;
  rows?: string[][];
  image?: string;
}

export interface TemplateInfo {
  id: string;
  originalName: string;
  filePath: string;
  size: number;
  uploadedAt: string;
  placeholders: string[];
  previewText?: string;
  paragraphs?: string[];
  blocks?: DocumentBlock[];
  watermarkText?: string;
  watermarkImage?: string;
  headerText?: string;
  indiaAddress?: string;
  usaAddress?: string;
}

export interface UploadResponse {
  message: string;
  template: TemplateInfo;
}

export interface ExtractResponse {
  templateId: string;
  placeholders: string[];
  previewText?: string;
  paragraphs?: string[];
  blocks?: DocumentBlock[];
  watermarkText?: string;
  watermarkImage?: string;
  headerText?: string;
  indiaAddress?: string;
  usaAddress?: string;
}

export interface GenerationResponse {
  message: string;
  docId: string;
  docxFilename: string;
  pdfFilename: string | null;
  docxUrl: string;
  pdfUrl: string | null;
  pdfError?: string;
  generatedAt: string;
}

export interface DownloadHistoryItem {
  docId: string;
  templateName: string;
  docxFilename: string;
  pdfFilename: string | null;
  generatedAt: string;
}
