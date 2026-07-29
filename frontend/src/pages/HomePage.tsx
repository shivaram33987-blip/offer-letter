import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Zap, Shield, FileCheck } from 'lucide-react';
import { Button } from '../components/Button';

export const HomePage: React.FC = () => {

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Automated Word & PDF Document Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Replace Placeholders & Generate <span className="text-blue-600">Word & PDF</span> Files Instantly
        </h1>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Upload any Microsoft Word template with tags like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-sm">{"{{name}}"}</code>, auto-detect variables, fill values in a dynamic form, and export clean DOCX and PDF documents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/upload">
            <Button size="lg" variant="primary" leftIcon={<Upload className="w-5 h-5" />}>
              Upload Template (.docx)
            </Button>
          </Link>
        </div>
      </section>



      {/* Feature Highlights Grid */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="glass-card p-6 space-y-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800">Auto Placeholder Parsing</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automatically scans body text, tables, headers, and footers for <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">{"{{tags}}"}</code> and builds dynamic input forms.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl w-fit">
            <FileCheck className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800">Format Preservation</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Maintains original typography, custom fonts, brand styling, line heights, tables, and images without degradation.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit">
            <Shield className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800">Dual Export (DOCX & PDF)</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generates high-resolution Word files and converts them into production-ready PDF files with one click.
          </p>
        </div>
      </section>
    </div>
  );
};
