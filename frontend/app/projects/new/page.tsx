"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  projectLocation: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high';
}

const CreateProjectPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectFormData>({
    projectName: '',
    projectDescription: '',
    buildingType: '',
    squareFootage: 0,
    numberOfFloors: 1,
    numberOfZones: 1,
    clientName: '',
    clientEmail: '',
    projectLocation: '',
    estimatedStartDate: '',
    estimatedEndDate: '',
    budget: 0,
    priority: 'medium'
  });

  const steps = [
    { id: 1, title: 'Project Details', description: 'Basic project information' },
    { id: 2, title: 'Data Sources', description: 'Connect to business systems' },
    { id: 3, title: 'Requirements', description: 'Upload documents & specifications' },
    { id: 4, title: 'Review & Create', description: 'Review and create project' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      
      // Redirect to project detail page instead of estimation wizard
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep projectData={projectData} onInputChange={handleInputChange} />;
      case 2:
        return <DataSourcesStep />;
      case 3:
        return <RequirementsStep />;
      case 4:
        return <ReviewStep projectData={projectData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Set up your project and connect data sources
                </p>
              </div>
              <Link
                href="/projects"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Progress Steps */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Setup</h2>
              
              {/* Progress Steps */}
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.id === currentStep
                          ? 'bg-blue-600 text-white'
                          : step.id < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.id < currentStep ? '✓' : step.id}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${
                        step.id === currentStep ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-8">
                {renderStep()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              <div className="flex space-x-3">
                {currentStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Project...' : 'Create Project & Start Estimation'}
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const ProjectDetailsStep: React.FC<{ projectData: ProjectFormData; onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void }> = ({ projectData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Details</h2>
        <p className="text-sm text-gray-600">Enter the basic information about your project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            name="projectName"
            value={projectData.projectName}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building Type *
          </label>
          <select
            name="buildingType"
            value={projectData.buildingType}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select building type</option>
            <option value="office">Office Building</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="warehouse">Warehouse</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Square Footage *
          </label>
          <input
            type="number"
            name="squareFootage"
            value={projectData.squareFootage}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter square footage"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Floors
          </label>
          <input
            type="number"
            name="numberOfFloors"
            value={projectData.numberOfFloors}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Number of floors"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Name
          </label>
          <input
            type="text"
            name="clientName"
            value={projectData.clientName}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter client name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Email
          </label>
          <input
            type="email"
            name="clientEmail"
            value={projectData.clientEmail}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter client email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Location
          </label>
          <input
            type="text"
            name="projectLocation"
            value={projectData.projectLocation}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={projectData.priority}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description
        </label>
        <textarea
          name="projectDescription"
          value={projectData.projectDescription}
          onChange={onInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your project requirements..."
        />
      </div>
    </div>
  );
};

const DataSourcesStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Data Sources</h2>
        <p className="text-sm text-gray-600">Connect to your business systems to automatically import project data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ERP System */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📊</div>
            <div>
              <h4 className="font-medium text-gray-900">ERP System</h4>
              <p className="text-xs text-gray-500">SAP, Oracle, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect ERP
          </button>
        </div>

        {/* CRM System */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">👥</div>
            <div>
              <h4 className="font-medium text-gray-900">CRM System</h4>
              <p className="text-xs text-gray-500">Salesforce, HubSpot, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect CRM
          </button>
        </div>

        {/* Project Management */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📋</div>
            <div>
              <h4 className="font-medium text-gray-900">Project Management</h4>
              <p className="text-xs text-gray-500">Jira, Asana, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect PM Tool
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Data Source Integration</h4>
            <p className="text-sm text-blue-700 mt-1">
              Connecting data sources will automatically populate project details, client information, and requirements from your existing business systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequirementsStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Requirements</h2>
        <p className="text-sm text-gray-600">Upload project documents and specifications.</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Project Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload specifications, drawings, requirements, or any other project documents.
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Choose Files
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Supports: PDF, DOCX, JPG, PNG, ZIP
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Document Processing</h4>
            <p className="text-sm text-gray-700 mt-1">
              Documents will be automatically processed to extract project requirements, specifications, and technical details for accurate estimation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{ projectData: ProjectFormData }> = ({ projectData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Project Details</h2>
        <p className="text-sm text-gray-600">Review all project information before creating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Project Name:</span>
              <p className="text-sm text-gray-900">{projectData.projectName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Building Type:</span>
              <p className="text-sm text-gray-900">{projectData.buildingType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Square Footage:</span>
              <p className="text-sm text-gray-900">{projectData.squareFootage} sq ft</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Floors:</span>
              <p className="text-sm text-gray-900">{projectData.numberOfFloors}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Client Name:</span>
              <p className="text-sm text-gray-900">{projectData.clientName || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Client Email:</span>
              <p className="text-sm text-gray-900">{projectData.clientEmail || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Location:</span>
              <p className="text-sm text-gray-900">{projectData.projectLocation || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <p className="text-sm text-gray-900 capitalize">{projectData.priority}</p>
            </div>
          </div>
        </div>
      </div>

      {projectData.projectDescription && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project Description</h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {projectData.projectDescription}
          </p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900">Ready to Create Project</h4>
            <p className="text-sm text-green-700 mt-1">
              After creating the project, you'll be redirected to the estimation wizard to generate detailed cost estimates and BOM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 