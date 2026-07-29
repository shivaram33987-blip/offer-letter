import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlaceholderForm } from '../components/PlaceholderForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { extractPlaceholders, generateDocx } from '../services/api';
import { DocumentBlock } from '../types';

export const FormPage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState<string>('');
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [watermarkText, setWatermarkText] = useState<string | undefined>();
  const [watermarkImage, setWatermarkImage] = useState<string | undefined>();
  const [headerText, setHeaderText] = useState<string | undefined>();
  const [indiaAddress, setIndiaAddress] = useState<string | undefined>();
  const [usaAddress, setUsaAddress] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) {
      navigate('/upload');
      return;
    }

    const loadPlaceholders = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await extractPlaceholders(templateId);
        setPlaceholders(res.placeholders || []);
        setPreviewText(res.previewText || '');
        setParagraphs(res.paragraphs || []);
        setBlocks(res.blocks || []);
        setWatermarkText(res.watermarkText);
        setWatermarkImage(res.watermarkImage);
        setHeaderText(res.headerText);
        setIndiaAddress(res.indiaAddress);
        setUsaAddress(res.usaAddress);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Failed to extract placeholders from template.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceholders();
  }, [templateId, navigate]);

  const handleSubmitValues = async (
    data: Record<string, any>,
    customReplacements: Record<string, string>
  ) => {
    if (!templateId) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const genRes = await generateDocx(templateId, data, customReplacements);

      navigate(`/download/${genRes.docId}`, {
        state: {
          docxFilename: genRes.docxFilename,
          pdfFilename: genRes.pdfFilename,
          pdfError: genRes.pdfError,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to generate documents.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <LoadingSpinner label="Analyzing document and generating preview..." size="lg" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-card p-8 max-w-lg mx-auto text-center space-y-4 my-10 border-rose-200">
        <div className="text-rose-600 font-bold text-lg">Error Loading Template</div>
        <p className="text-xs text-slate-600">{errorMsg}</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
        >
          Upload New Template
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <PlaceholderForm
        placeholders={placeholders}
        previewText={previewText}
        paragraphs={paragraphs}
        blocks={blocks}
        watermarkText={watermarkText}
        watermarkImage={watermarkImage}
        headerText={headerText}
        indiaAddress={indiaAddress}
        usaAddress={usaAddress}
        onSubmit={handleSubmitValues}
        isGenerating={isGenerating}
        onReset={() => navigate('/upload')}
      />
    </div>
  );
};
