import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { DownloadCard } from '../components/DownloadCard';

interface RouteState {
  docxFilename?: string;
  pdfFilename?: string | null;
  pdfError?: string;
}

export const DownloadPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as RouteState) || {};

  // Fallback filename if navigated directly
  const docxFilename = state.docxFilename || `generated_${docId}.docx`;
  const pdfFilename = state.pdfFilename !== undefined ? state.pdfFilename : `generated_${docId}.pdf`;

  return (
    <div className="py-8 sm:py-12">
      <DownloadCard
        docxFilename={docxFilename}
        pdfFilename={pdfFilename}
        pdfError={state.pdfError}
        onStartNew={() => navigate('/upload')}
      />
    </div>
  );
};
