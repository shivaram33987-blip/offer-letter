import React from 'react';
import { FileText, FileCode, Clock, HardDrive, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface FileCardProps {
  title: string;
  subtitle?: string;
  size?: number;
  date?: string;
  badge?: string;
  type?: 'docx' | 'pdf';
  onAction?: () => void;
  actionText?: string;
  onDelete?: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  title,
  subtitle,
  size,
  date,
  badge,
  type = 'docx',
  onAction,
  actionText = 'Select',
  onDelete,
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className={`p-3 rounded-xl ${type === 'pdf' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
          {type === 'pdf' ? <FileCode className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-1">{title}</h4>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            {size && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {formatSize(size)}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(date)}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete template"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {onAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};
