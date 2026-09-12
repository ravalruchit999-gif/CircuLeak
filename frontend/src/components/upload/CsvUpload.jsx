import React, { useState } from 'react';
import { UploadDropzone } from './UploadDropzone';
import { UploadValidation } from './UploadValidation';
import { UploadSummary } from './UploadSummary';
import { uploadProcessCsv } from '../../services/uploadApi';

export function CsvUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadProcessCsv(file);
      setUploadResult(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UploadDropzone onFileSelected={handleFileSelect} isUploading={isUploading} />
      {uploadResult && (
        <>
          <UploadValidation result={uploadResult} />
          <UploadSummary result={uploadResult} />
        </>
      )}
    </div>
  );
}
