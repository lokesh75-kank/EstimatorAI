"use client";

import React, { useState, useCallback } from 'react';
import { DataSourceFormData, ConnectionDetails } from '@/types/dataSources';

interface Step2FileUploadProps {
  formData: DataSourceFormData;
  onComplete: (stepData: Partial<DataSourceFormData>) => void;
  onBack: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface AIAnalysisResult {
  vendors: Array<{
    name: string;
    confidence: number;
    description: string;
    specialties: string[];
  }>;
  materials: Array<{
    name: string;
    category: string;
    specifications: string;
    estimatedCost: string;
  }>;
  projectDetails: {
    type: string;
    scope: string;
    requirements: string[];
    timeline: string;
  };
  recommendations: string[];
}

export const Step2FileUpload: React.FC<Step2FileUploadProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add file to list with uploading status
      const newFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        status: 'uploading',
        progress: 0
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      
      try {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Update file status to processing
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'processing', url: result.file.fileUrl }
              : f
          )
        );
        
        // Process with AI
        await processFileWithAI(result.file.localPath, file.name);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );
      }
    }
    
    setIsUploading(false);
  };

  const processFileWithAI = async (filePath: string, fileName: string) => {
    setIsAnalyzing(true);
    
    try {
      // Call backend API to process document with AI
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath,
          fileName,
          projectType: 'fire_security_systems'
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update file status to completed
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === fileName 
            ? { ...f, status: 'completed' }
            : f
        )
      );
      
      // Set analysis result
      setAnalysisResult(result.analysis);
      
    } catch (error) {
      console.error('Error processing file with AI:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === fileName 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'AI processing failed' }
            : f
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (analysisResult && uploadedFiles.some(f => f.status === 'completed')) {
      // Create connection details with file information
      const connectionDetails: ConnectionDetails = {
        fileUrl: uploadedFiles.find(f => f.status === 'completed')?.url || '',
        // Add other relevant connection details
      };
      
      onComplete({ 
        connectionDetails,
        // Add analysis results to form data for later use
        description: `AI-analyzed project documents: ${uploadedFiles.map(f => f.name).join(', ')}`
      });
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    if (uploadedFiles.length === 1) {
      setAnalysisResult(null);
    }
  };

  const isNextEnabled = analysisResult && uploadedFiles.some(f => f.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Project Documents</h3>
        <p className="text-sm text-gray-600">
          Upload your project documents and let our AI analyze them to recommend vendors, materials, and project details.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your project documents here
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Supports PDF, DOCX, TXT files up to 20MB
            </p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose Files
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {file.status === 'uploading' && '📤'}
                  {file.status === 'processing' && '🤖'}
                  {file.status === 'completed' && '✅'}
                  {file.status === 'error' && '❌'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.status === 'uploading' && (
                  <div className="text-xs text-gray-500">Uploading...</div>
                )}
                {file.status === 'processing' && (
                  <div className="text-xs text-gray-500">AI Processing...</div>
                )}
                {file.status === 'completed' && (
                  <div className="text-xs text-green-600">Completed</div>
                )}
                {file.status === 'error' && (
                  <div className="text-xs text-red-600">{file.error}</div>
                )}
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Results */}
      {analysisResult && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">AI Analysis Results</h4>
          
          {/* Vendors */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Recommended Vendors</h5>
            <div className="space-y-2">
              {analysisResult.vendors.map((vendor, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-600">{vendor.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vendor.specialties.map((specialty, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {Math.round(vendor.confidence * 100)}% match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-green-900 mb-2">Recommended Materials</h5>
            <div className="space-y-2">
              {analysisResult.materials.map((material, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{material.name}</p>
                      <p className="text-xs text-gray-600">{material.category}</p>
                      <p className="text-xs text-gray-500 mt-1">{material.specifications}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {material.estimatedCost}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-purple-900 mb-2">Project Analysis</h5>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-700">Project Type</p>
                <p className="text-sm text-gray-900">{analysisResult.projectDetails.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Scope</p>
                <p className="text-sm text-gray-900">{analysisResult.projectDetails.scope}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Timeline</p>
                <p className="text-sm text-gray-900">{analysisResult.projectDetails.timeline}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Requirements</p>
                <ul className="text-sm text-gray-900 mt-1">
                  {analysisResult.projectDetails.requirements.map((req, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-yellow-900 mb-2">AI Recommendations</h5>
            <ul className="space-y-1">
              {analysisResult.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loading States */}
      {(isUploading || isAnalyzing) && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            {isUploading ? 'Uploading files...' : 'AI is analyzing your documents...'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isNextEnabled}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 