"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/Chat/ChatInterface';
import { apiService } from '@/services/api';

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
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user makes changes
    setError(null);
  };

  const handleNext = async () => {
    if (currentStep === 1 && !projectId) {
      // Validate only projectName (and optionally projectDescription) on step 1
      if (!projectDetails.projectName) {
        setError('Please enter a project name.');
        return;
      }
      setError(null);
      setCurrentStep(prev => prev + 1);
      return;
    }
    if (currentStep === 2 && !projectId) {
      // Validate building details on step 2
      if (!projectDetails.buildingType || !projectDetails.squareFootage) {
        setError('Please fill in all building details.');
        return;
      }
      setError(null);
      // Create project on step 2
      try {
        setIsSubmitting(true);
        const project = await apiService.createProject({
          projectName: projectDetails.projectName,
          clientName: projectDetails.projectName, // Using project name as client name for now
          clientEmail: 'temp@example.com', // This should be replaced with actual user email
          clientPhone: '', // Optional
          buildingType: projectDetails.buildingType,
          buildingSize: projectDetails.squareFootage.toString(),
          location: {
            address: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
          },
          requirements: {
            floors: projectDetails.numberOfFloors,
            zones: projectDetails.numberOfZones,
            description: projectDetails.projectDescription,
            squareFootage: projectDetails.squareFootage
          },
          status: 'draft',
          messages: [],
          history: [],
          metadata: {}
        });
        if (!project || !project.id) {
          throw new Error('Failed to create project: Invalid response from server');
        }
        setProjectId(project.id);
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Failed to create project:', error);
        setError(error instanceof Error ? error.message : 'Failed to create project. Please try again.');
        return;
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    
    try {
      setIsSubmitting(true);
      // Update project status to estimation_in_progress
      await apiService.updateProject(projectId, {
        status: 'estimation_in_progress'
      });
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Project Overview' },
    { id: 2, title: 'Building Details' },
    { id: 3, title: 'Upload Documents' },
    { id: 4, title: 'Chat & Clarification' },
    { id: 5, title: 'Review & Submit' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Building Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Building Type</label>
                <select
                  name="buildingType"
                  value={projectDetails.buildingType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
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
                  required
                  min="0"
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            <p className="text-sm text-gray-600">
              Upload any relevant documents, drawings, or specifications for your project.
            </p>
            <div className="mt-4">
              <input
                type="file"
                multiple
                className="input-field"
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
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
              {projectId && <ChatInterface projectId={projectId} />}
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
              </dl>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">New Estimation</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-900">{step.title}</div>
                {index < steps.length - 1 && (
                  <div className="w-24 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default EstimationWizard; 