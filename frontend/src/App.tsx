import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { FormPage } from './pages/FormPage';
import { DownloadPage } from './pages/DownloadPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/form/:templateId" element={<FormPage />} />
            <Route path="/download/:docId" element={<DownloadPage />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>DocuFlow © {new Date().getFullYear()} — Word Placeholder & PDF Engine</span>
            <span>Built with React 19, Express & TypeScript</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
