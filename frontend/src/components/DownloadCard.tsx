import React from 'react';
import { Download, FileCode, CheckCircle2, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { getDownloadUrl } from '../services/api';

interface DownloadCardProps {
  docxFilename: string;
  pdfFilename: string | null;
  pdfError?: string;
  onStartNew: () => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  pdfFilename,
  onStartNew,
}) => {
  const [copied, setCopied] = React.useState(false);

  const activePdfName = pdfFilename || 'generated_document.pdf';
  const pdfDownloadUrl = getDownloadUrl(activePdfName);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto border border-slate-200/80 shadow-2xl space-y-6 text-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">PDF Generated Successfully!</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Your custom PDF document has been created and is ready for immediate download.
        </p>
      </div>

      {/* PDF Download Main Card */}
      <div className="bg-gradient-to-b from-rose-50/80 to-rose-100/40 border border-rose-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-sm">
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/30 animate-pulse">
          <FileCode className="w-10 h-10" />
        </div>

        <div>
          <h4 className="font-extrabold text-slate-900 text-base">PDF Document</h4>
          <p className="text-xs text-slate-500 font-mono mt-1 truncate max-w-[240px]">
            {activePdfName}
          </p>
        </div>

        <a href={pdfDownloadUrl} download className="w-full">
          <Button
            type="button"
            variant="danger"
            size="lg"
            className="w-full py-3.5 shadow-md shadow-rose-500/20 text-base"
            leftIcon={<Download className="w-5 h-5" />}
          >
            Download PDF
          </Button>
        </a>
      </div>

      {/* Footer Utility Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        >
          {copied ? 'Copied!' : 'Copy Share Link'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onStartNew}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Generate Another PDF
        </Button>
      </div>
    </div>
  );
};
