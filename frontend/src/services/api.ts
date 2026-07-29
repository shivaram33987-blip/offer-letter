import axios from 'axios';
import { UploadResponse, ExtractResponse, GenerationResponse, TemplateInfo } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadTemplate = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/templates/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const extractPlaceholders = async (templateId: string): Promise<ExtractResponse> => {
  const response = await api.post<ExtractResponse>('/templates/extract', { templateId });
  return response.data;
};

export const fetchTemplates = async (): Promise<{ templates: TemplateInfo[] }> => {
  const response = await api.get<{ templates: TemplateInfo[] }>('/templates');
  return response.data;
};

export const generateDocx = async (
  templateId: string,
  data: Record<string, any>,
  customReplacements?: Record<string, string>
): Promise<GenerationResponse> => {
  const response = await api.post<GenerationResponse>('/generate/docx', {
    templateId,
    data,
    customReplacements,
  });
  return response.data;
};

export const generatePdf = async (
  docxFilename?: string,
  templateId?: string,
  data?: Record<string, any>
): Promise<{ pdfFilename: string; pdfUrl: string; message: string }> => {
  const response = await api.post('/generate/pdf', {
    docxFilename,
    templateId,
    data,
  });
  return response.data;
};

export const deleteTemplate = async (templateId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/templates/${templateId}`);
  return response.data;
};

export const getDownloadUrl = (filename: string): string => {
  return `${API_BASE_URL}/download/${filename}`;
};
