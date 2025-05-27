"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/Chat/ChatInterface';
import documentService from '@/services/documentService';

interface ProjectDetails {
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  projectName: string;
  projectDescription: string;
}

const EstimationWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    buildingType: '',
    squareFootage: 0,
    numberOfFloors: 1,
    numberOfZones: 1,
    projectName: '',
    projectDescription: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedMetadata, setExtractedMetadata] = useState<Record<string, any> | null>(null);

  const steps = [
    { id: 1, title: 'Project Overview' },
    { id: 2, title: 'Building Details' },
    { id: 3, title: 'Upload Documents' },
    { id: 4, title: 'Chat & Clarification' },
    { id: 5, title: 'Review & Submit' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    setIsUploading(true);

    try {
      // Only process the first file for metadata extraction for now
      if (files.length > 0) {
        const metadata = await documentService.uploadDocument(files[0]);
        setExtractedMetadata(metadata.extractedData);
        // Optionally auto-fill fields if metadata is available
        setProjectDetails(prev => ({
          ...prev,
          buildingType: metadata.extractedData?.buildingType || prev.buildingType,
          squareFootage: metadata.extractedData?.squareFootage || prev.squareFootage,
          numberOfFloors: metadata.extractedData?.numberOfFloors || prev.numberOfFloors,
          numberOfZones: metadata.extractedData?.numberOfZones || prev.numberOfZones,
        }));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      // If we're on the first step, navigate back to the previous page
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement API call to save project details
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={projectDetails.projectName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="form-label">Project Description</label>
                <textarea
                  name="projectDescription"
                  value={projectDetails.projectDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your project..."
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Building Details</h2>
            {extractedMetadata && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-700 mb-2">Extracted Metadata</h3>
                <ul className="text-sm text-blue-900 space-y-1">
                  {Object.entries(extractedMetadata).map(([key, value]) => (
                    <li key={key}><span className="font-medium">{key}:</span> {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Building Type</label>
                <select
                  name="buildingType"
                  value={projectDetails.buildingType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select Building Type</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed-use">Mixed Use</option>
                </select>
              </div>
              <div>
                <label className="form-label">Total Square Footage</label>
                <input
                  type="number"
                  name="squareFootage"
                  value={projectDetails.squareFootage}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter square footage"
                />
              </div>
              <div>
                <label className="form-label">Number of Floors</label>
                <input
                  type="number"
                  name="numberOfFloors"
                  value={projectDetails.numberOfFloors}
                  onChange={handleInputChange}
                  min="1"
                  className="input-field"
                  placeholder="Enter number of floors"
                />
              </div>
              <div>
                <label className="form-label">Number of Zones</label>
                <input
                  type="number"
                  name="numberOfZones"
                  value={projectDetails.numberOfZones}
                  onChange={handleInputChange}
                  min="1"
                  className="input-field"
                  placeholder="Enter number of zones"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-4 text-sm text-gray-600">
                  Drag and drop your RFQs, blueprints, and SOWs here, or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary mt-4"
                >
                  {isUploading ? 'Uploading...' : 'Select Files'}
                </label>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {extractedMetadata && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-700 mb-2">Extracted Metadata</h3>
                <ul className="text-sm text-blue-900 space-y-1">
                  {Object.entries(extractedMetadata).map(([key, value]) => (
                    <li key={key}><span className="font-medium">{key}:</span> {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Chat & Clarification</h2>
            <p className="text-sm text-gray-600">
              Ask questions about your estimation, building codes, or requirements.
            </p>
            <div className="mt-4">
              <ChatInterface projectId="temp" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900">Project Summary</h3>
              <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectDetails.projectName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Building Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectDetails.buildingType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectDetails.squareFootage}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Number of Floors</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectDetails.numberOfFloors}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Number of Zones</dt>
                  <dd className="mt-1 text-sm text-gray-900">{projectDetails.numberOfZones}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uploaded Files</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {uploadedFiles.length} file(s)
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                step.id !== steps.length ? 'flex-1' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              {step.id !== steps.length && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        {renderStep()}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="btn-secondary"
        >
          {currentStep === 1 ? 'Back to Dashboard' : 'Back'}
        </button>
        {currentStep === steps.length ? (
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default EstimationWizard; 