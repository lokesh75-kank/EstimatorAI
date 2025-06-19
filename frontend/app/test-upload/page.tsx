"use client";

import React, { useState, useRef } from 'react';

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    setIsUploading(true);
    setUploadError(null);
    
    const fileArray = Array.from(files);
    const newFiles = fileArray.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileId = newFiles[i].id;
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        console.log('Upload result:', result);
        
        const updatedFile = {
          ...newFiles[i],
          status: 'success' as const,
          url: result.file?.fileUrl || `/api/uploads/${result.file?.storedName}`
        };
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? updatedFile : f
        ));

      } catch (error: any) {
        console.error('Upload error:', error);
        const errorFile = {
          ...newFiles[i],
          status: 'error' as const,
          error: error.message
        };
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? errorFile : f
        ));
        setUploadError(error.message);
      }
    }
    
    setIsUploading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    return '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">File Upload Test</h1>
          
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
              />

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="text-4xl">📄</div>
                  <h3 className="text-lg font-medium text-gray-900">Click to upload files</h3>
                  <p className="text-sm text-gray-600">or drag and drop files here</p>
                  <p className="text-xs text-gray-500">
                    Supports: PDF, DOCX, JPG, PNG, ZIP (Max 20MB per file)
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading files...</p>
                </div>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Upload Error</h4>
                      <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        file.status === 'error' 
                          ? 'border-red-200 bg-red-50' 
                          : file.status === 'success'
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          {file.url && (
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              View file
                            </a>
                          )}
                          {file.error && (
                            <p className="text-xs text-red-600 mt-1">{file.error}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        )}
                        {file.status === 'success' && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {file.status === 'error' && (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Local File Storage</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Files are stored locally in the uploads/ directory. This is for development purposes only. 
                    In production, files would be stored in cloud storage like AWS S3.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 