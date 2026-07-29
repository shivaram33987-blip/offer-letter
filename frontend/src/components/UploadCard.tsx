import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { uploadTemplate } from '../services/api';
import { TemplateInfo } from '../types';

interface UploadCardProps {
  onUploadSuccess: (template: TemplateInfo) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB max size
    onDropAccepted: (files) => {
      setErrorMsg(null);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        setErrorMsg('File size exceeds the 20 MB limit.');
      } else if (error?.code === 'file-invalid-type') {
        setErrorMsg('Invalid file format. Only .docx files are allowed.');
      } else {
        setErrorMsg(error?.message || 'Selected file is invalid.');
      }
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await uploadTemplate(selectedFile);
      onUploadSuccess(res.template);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to upload template file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 max-w-xl mx-auto border border-slate-200/80 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Word Template</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select or drag & drop a Microsoft Word (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs">.docx</code>) template file containing <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">{"{{placeholders}}"}</code>.
        </p>
      </div>

      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : isDragReject
            ? 'border-rose-400 bg-rose-50/50'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-3">
          {selectedFile ? (
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Upload className="w-8 h-8" />
            </div>
          )}

          <div>
            {selectedFile ? (
              <div>
                <p className="text-base font-semibold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isDragActive ? 'Drop your .docx template here...' : 'Click to browse or drag & drop template'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports Microsoft Word (.docx) up to 20 MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {selectedFile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              setErrorMsg(null);
            }}
            disabled={isUploading}
          >
            Choose Different File
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto ml-auto"
          disabled={!selectedFile || isUploading}
          isLoading={isUploading}
          onClick={handleUpload}
          rightIcon={<FileText className="w-4 h-4" />}
        >
          {isUploading ? 'Analyzing Template...' : 'Extract Placeholders'}
        </Button>
      </div>
    </div>
  );
};
