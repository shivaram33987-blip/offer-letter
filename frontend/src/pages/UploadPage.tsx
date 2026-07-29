import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCard } from '../components/UploadCard';
import { TemplateInfo } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (template: TemplateInfo) => {
    // Redirect to form page for extracted placeholders
    navigate(`/form/${template.id}`);
  };

  return (
    <div className="py-8 sm:py-12">
      <UploadCard onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};
