import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from './InputField';
import { Button } from './Button';
import { Sparkles, FileCheck, RefreshCw, Plus, Trash2, Eye, Replace, FileText, MousePointerClick, Check, Stamp } from 'lucide-react';
import { DocumentBlock } from '../types';

export interface CustomReplacementPair {
  id: string;
  targetWord: string;
  replacementWord: string;
}

interface PlaceholderFormProps {
  placeholders: string[];
  previewText?: string;
  paragraphs?: string[];
  blocks?: DocumentBlock[];
  watermarkText?: string;
  watermarkImage?: string;
  headerText?: string;
  indiaAddress?: string;
  usaAddress?: string;
  onSubmit: (data: Record<string, any>, customReplacements: Record<string, string>) => void;
  isGenerating: boolean;
  onReset?: () => void;
  onDeleteTemplate?: () => void;
}

export const PlaceholderForm: React.FC<PlaceholderFormProps> = ({
  placeholders,
  previewText,
  paragraphs = [],
  blocks = [],
  watermarkText,
  watermarkImage,
  indiaAddress,
  usaAddress,
  onSubmit,
  isGenerating,
  onReset,
  onDeleteTemplate,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, any>>();

  const replacementInputRef = useRef<HTMLInputElement | null>(null);

  // Custom find & replace pairs
  const [customPairs, setCustomPairs] = useState<CustomReplacementPair[]>([]);
  const [newTarget, setNewTarget] = useState<string>('');
  const [newReplacement, setNewReplacement] = useState<string>('');
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Active tab for mobile
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const handleAddCustomPair = (target?: string, replacement?: string) => {
    const t = (target !== undefined ? target : newTarget).trim();
    const r = (replacement !== undefined ? replacement : newReplacement).trim();

    if (!t) return;

    setCustomPairs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        targetWord: t,
        replacementWord: r,
      },
    ]);

    if (target === undefined) setNewTarget('');
    if (replacement === undefined) setNewReplacement('');

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleRemoveCustomPair = (id: string) => {
    setCustomPairs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTextSelectionInPreview = () => {
    const selected = window.getSelection()?.toString().trim();
    if (selected && selected.length > 0) {
      setNewTarget(selected);
      // Auto-focus replacement input
      setTimeout(() => replacementInputRef.current?.focus(), 100);
    }
  };

  const onFormSubmit = (data: Record<string, any>) => {
    const customMap: Record<string, string> = {};
    for (const pair of customPairs) {
      if (pair.targetWord.trim()) {
        customMap[pair.targetWord.trim()] = pair.replacementWord;
      }
    }
    if (newTarget.trim()) {
      customMap[newTarget.trim()] = newReplacement;
    }

    onSubmit(data, customMap);
  };

  const totalReplacementsCount = customPairs.length + (newTarget.trim() ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Placeholder Replacement & Document Customizer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill placeholders or select any word/text from the live document preview to replace.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile view toggle */}
          <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Form & Words
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Live Preview
            </button>
          </div>

          {onReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Change Template
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Word Replacements */}
        <div className={`lg:col-span-7 space-y-6 ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* 1. Detected Placeholders (if {{tags}} exist) */}
            {placeholders && placeholders.length > 0 && (
              <div className="glass-card p-6 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Detected Placeholders ({placeholders.length})
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Auto-detected {"{{...}}"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {placeholders.map((ph) => (
                    <InputField
                      key={ph}
                      name={ph}
                      label={ph}
                      register={register}
                      error={errors[ph] as any}
                      required={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Custom Find & Replace Word Builder */}
            <div className="glass-card p-6 border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Replace className="w-4 h-4 text-indigo-600" />
                    Replace Any Word or Phrase in Document
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enter any text present in the document to find and replace with a new value.
                  </p>
                </div>
              </div>

              {/* Add New Custom Pair Form Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Text / Section to Modify or Delete
                    </label>
                    <input
                      type="text"
                      placeholder="Select text in preview or enter text..."
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      New Replacement Value (Optional)
                    </label>
                    <input
                      ref={replacementInputRef}
                      type="text"
                      placeholder="New text (or click Delete to remove)"
                      value={newReplacement}
                      onChange={(e) => setNewReplacement(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                    Select any text in live preview to target it.
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleAddCustomPair(newTarget, '')}
                      disabled={!newTarget.trim()}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Delete Selected Text
                    </Button>

                    <Button
                      type="button"
                      variant={addedToast ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleAddCustomPair()}
                      disabled={!newTarget.trim()}
                      leftIcon={addedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                    >
                      {addedToast ? 'Added!' : 'Replace Word'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Replacement Pairs List */}
              {customPairs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Queued Modifications & Deletions ({customPairs.length})
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customPairs.map((pair) => (
                      <div
                        key={pair.id}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded line-clamp-1 border border-slate-200">
                            "{pair.targetWord}"
                          </span>
                          <span className="text-slate-400 font-bold">→</span>
                          {pair.replacementWord === '' ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1">
                              <Trash2 className="w-3 h-3 text-rose-600" /> [REMOVE / DELETE]
                            </span>
                          ) : (
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded line-clamp-1 border border-blue-200">
                              "{pair.replacementWord}"
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCustomPair(pair.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="glass-card p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Generate PDF Document</p>
                <p className="text-xs text-slate-500">
                  {totalReplacementsCount > 0
                    ? `${totalReplacementsCount} custom word replacement(s) will be applied to your PDF.`
                    : 'Applies all values and generates your PDF output file.'}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                isLoading={isGenerating}
                rightIcon={<FileCheck className="w-5 h-5" />}
              >
                {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Document Text Preview */}
        <div className={`lg:col-span-5 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="glass-card border border-slate-200/80 overflow-hidden sticky top-20 shadow-2xl rounded-2xl">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs uppercase tracking-wider">Live Document Preview</span>
              </div>

              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <Stamp className="w-3 h-3 text-emerald-400" />
                100% Word Layout
              </span>
            </div>

            {/* Dark Sheet Container */}
            <div className="bg-slate-900/95 p-4 sm:p-5 max-h-[640px] overflow-y-auto">
              {/* White A4 Paper Sheet */}
              <div
                onMouseUp={handleTextSelectionInPreview}
                className="bg-white min-h-[680px] shadow-2xl rounded-sm p-6 sm:p-8 relative font-serif text-xs text-slate-900 leading-relaxed select-text space-y-3 border border-slate-200"
              >
                {/* 1. Header Logo (Top Right) */}
                {watermarkImage && (
                  <div className="flex justify-end mb-4 relative z-10">
                    <img src={watermarkImage} alt="Header Logo" className="max-h-16 object-contain" />
                  </div>
                )}

                {/* 2. Large Centered Background Watermark Image */}
                {watermarkImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-20 overflow-hidden p-6">
                    <img src={watermarkImage} alt="Watermark Background" className="w-[85%] max-h-[75%] object-contain" />
                  </div>
                )}

                {/* 3. Text Watermark Overlay */}
                {watermarkText && !watermarkImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-15 font-black text-3xl sm:text-4xl text-slate-900 rotate-[-30deg] uppercase tracking-widest text-center px-6">
                    {watermarkText}
                  </div>
                )}

                {/* 4. Document Body Content (Paragraphs & Tables) */}
                <div className="relative z-10 space-y-3">
                  {blocks && blocks.length > 0 ? (
                    blocks.map((block, bIdx) => {
                      if (block.type === 'table' && block.rows && block.rows.length > 0) {
                        return (
                          <div key={bIdx} className="my-4 overflow-x-auto rounded-xl border border-slate-300 shadow-2xs bg-white">
                            <table className="w-full text-xs text-left border-collapse">
                              <tbody>
                                {block.rows.map((row, rIdx) => {
                                  const isHeader = rIdx === 0 || rIdx === 1;
                                  return (
                                    <tr
                                      key={rIdx}
                                      className={
                                        isHeader
                                          ? 'bg-slate-100 font-bold border-b border-slate-300 text-slate-900'
                                          : 'border-b border-slate-200 hover:bg-blue-50/50 text-slate-800'
                                      }
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          colSpan={row.length === 1 ? 3 : 1}
                                          onClick={() => {
                                            if (cell.trim()) setNewTarget(cell.trim().substring(0, 40));
                                          }}
                                          className="p-2 border-r border-slate-200 last:border-r-0 cursor-pointer font-medium"
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // Skip rendering merged Signature:Date: strings in body as they are formatted cleanly in footer
                      if (block.text && /^Signature:?\s*Date:?/i.test(block.text.trim())) {
                        return null;
                      }

                      const isHeading =
                        block.text &&
                        (block.text.startsWith('SUBJECT:') ||
                          block.text.startsWith('1.') ||
                          block.text.startsWith('ANNUAL') ||
                          block.text.startsWith('JOB TITLE:'));
                      const isItalicHeader =
                        block.text && (block.text.startsWith('Ref. no.:') || block.text.startsWith('Mr. Kata'));

                      return (
                        <div key={bIdx} className="space-y-1">
                          {block.image && (
                            <div className="my-1.5">
                              <img
                                src={block.image}
                                alt="Document Signature"
                                className="max-h-20 max-w-[220px] object-contain rounded border border-slate-200 p-1 bg-white shadow-2xs"
                              />
                            </div>
                          )}
                          {block.text && (
                            <p
                              onClick={() => {
                                const sel = window.getSelection()?.toString().trim();
                                if (!sel && block.text) {
                                  setNewTarget(block.text.trim().substring(0, 40));
                                }
                              }}
                              className={`p-1 rounded hover:bg-blue-50/80 transition-colors cursor-pointer ${
                                isHeading
                                  ? 'font-bold text-slate-900 text-xs tracking-wide uppercase mt-3 mb-1 border-b border-slate-200 pb-0.5'
                                  : isItalicHeader
                                  ? 'italic font-semibold text-slate-800'
                                  : 'text-slate-800'
                              }`}
                            >
                              {block.text}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : paragraphs && paragraphs.length > 0 ? (
                    paragraphs.map((p, idx) => (
                      <p key={idx} className="p-1 rounded hover:bg-blue-50/80 cursor-pointer text-slate-800">
                        {p}
                      </p>
                    ))
                  ) : previewText ? (
                    <div className="whitespace-pre-wrap">{previewText}</div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Document preview unavailable</p>
                    </div>
                  )}
                </div>

                {/* 5. Document Footer Section (2-Column Registered Office Addresses & Signatures) */}
                <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-800 leading-normal relative z-10">
                  {/* Left Column: Signature & India Address */}
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 text-xs">
                      Signature:
                    </div>

                    <div className="pt-2 space-y-1">
                      <p className="font-bold text-slate-900 underline">Our Registered Office Address:</p>
                      <p className="text-slate-800 font-medium leading-snug">
                        {indiaAddress || 'INDIA: 2-27-163, Gandhi Nagar, Wanaparthy, Telangana, India 509103.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Date & USA Address */}
                  <div className="space-y-3">
                    <div className="font-bold text-slate-900 text-xs sm:text-right">
                      Date:
                    </div>

                    <div className="pt-7 space-y-1 sm:text-left">
                      <p className="text-slate-800 font-medium leading-snug">
                        {usaAddress || 'USA: 5 Green-tree Centre, Dr 525, Route 73, STE 104, Burlington City, New Jersey 08053.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border-t border-slate-800 p-3 text-center text-[11px] text-slate-400 font-medium">
              💡 Select any text or table cell in the preview above to replace any word or phrase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
