"use client";

import React, { useState, useEffect } from 'react';
import { useProjectSession } from '@/hooks/useProjectSession';

export default function TestSessionPage() {
  const { 
    sessionId, 
    projectData, 
    loading, 
    error, 
    createSession, 
    updateSession, 
    loadSession,
    clearSession 
  } = useProjectSession();
  
  const [testFile, setTestFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!testFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', testFile);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      const uploadedFile = {
        id: `test-${Date.now()}`,
        name: testFile.name,
        size: testFile.size,
        type: testFile.type,
        url: result.file?.fileUrl || `/api/uploads/${result.file?.storedName}`,
        status: 'success' as const
      };

      // Update session with the uploaded file
      await updateSession({
        uploadedFiles: [uploadedFile]
      });
      
      console.log('File uploaded and session updated:', uploadedFile);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Session Debug Test</h1>
          
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-blue-900 mb-3">Session Information</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Session ID:</strong> {sessionId || 'None'}</div>
                <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                <div><strong>Error:</strong> {error || 'None'}</div>
                <div><strong>Project Data:</strong> {projectData ? 'Loaded' : 'None'}</div>
                <div><strong>Uploaded Files:</strong> {projectData?.uploadedFiles?.length || 0} files</div>
              </div>
            </div>

            {/* File Upload Test */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-green-900 mb-3">File Upload Test</h2>
              <div className="space-y-3">
                <input
                  type="file"
                  onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleFileUpload}
                  disabled={!testFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload File & Update Session
                </button>
              </div>
            </div>

            {/* Uploaded Files Display */}
            {projectData?.uploadedFiles && projectData.uploadedFiles.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-medium text-yellow-900 mb-3">Uploaded Files in Session</h2>
                <div className="space-y-2">
                  {projectData.uploadedFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                      <div className="text-lg">📄</div>
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {file.size} bytes • {file.type}
                        </div>
                        <div className="text-xs text-blue-600">{file.url}</div>
                      </div>
                      <div className="text-sm text-gray-500">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Actions</h2>
              <div className="space-x-3">
                <button
                  onClick={() => createSession()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create New Session
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => clearSession()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Session
                </button>
              </div>
            </div>

            {/* Raw Data */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Raw Session Data</h2>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                {JSON.stringify({ sessionId, projectData, loading, error }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 