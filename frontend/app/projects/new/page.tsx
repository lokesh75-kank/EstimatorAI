"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjectSession } from '@/hooks/useProjectSession';

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectLocation: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high';
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>;
}

const CreateProjectPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Session management
  const {
    sessionId,
    projectData,
    currentStep,
    completedSteps,
    loading: sessionLoading,
    error: sessionError,
    createSession,
    updateSession,
    loadSession,
    clearSession,
    autoSave,
    setCurrentStep,
    setProjectData
  } = useProjectSession();

  // Initialize session on page load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSessionId = localStorage.getItem('projectSessionId');
        if (savedSessionId && savedSessionId.length > 0) {
          console.log('Attempting to load existing session:', savedSessionId);
          await loadSession(savedSessionId);
        } else {
          console.log('No saved session found, creating new session');
          await createSession();
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        // Clear any invalid session ID and create new session
        localStorage.removeItem('projectSessionId');
        await createSession();
      }
    };

    initializeSession();
  }, []);

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      setError(sessionError);
    }
  }, [sessionError]);

  // Debug session data changes
  useEffect(() => {
    console.log('Main page: projectData changed', projectData);
    console.log('Main page: currentStep', currentStep);
    console.log('Main page: sessionLoading', sessionLoading);
  }, [projectData, currentStep, sessionLoading]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'projectName':
        if (!value.trim()) return 'Project name is required';
        if (value.length > 100) return 'Project name must be less than 100 characters';
        return '';
      case 'buildingType':
        if (!value) return 'Building type is required';
        return '';
      case 'squareFootage':
        if (!value || value <= 0) return 'Square footage must be greater than 0';
        if (value > 1000000) return 'Square footage seems too large';
        return '';
      case 'clientEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'budget':
        if (value < 0) return 'Budget cannot be negative';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = e.target.type === 'number' ? Number(value) : value;
    
    const updatedData = {
      ...projectData,
      [name]: newValue
    };
    
    setProjectData(updatedData);

    // Auto-save on input change - only for step 1 (Project Details)
    if (currentStep === 1) {
      autoSave({ [name]: newValue });
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Only validate fields on step 1 (Project Details)
    if (currentStep === 1) {
      const { name, value } = e.target;
      const error = validateField(name, value);
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };

  const canProceedToNext = () => {
    if (!projectData) return false;
    
    // Only validate step 1 fields when on step 1
    if (currentStep === 1) {
      const requiredFields = ['projectName', 'buildingType', 'squareFootage'];
      const hasRequiredFields = requiredFields.every(field => 
        projectData[field as keyof ProjectFormData] && 
        String(projectData[field as keyof ProjectFormData]).trim() !== ''
      );
      
      const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');
      
      return hasRequiredFields && !hasValidationErrors;
    }
    
    // For other steps, allow proceeding
    return true;
  };

  const handleNext = async () => {
    if (!projectData) return;
    
    // Validate fields only for step 1 (Project Details)
    if (currentStep === 1) {
      const errors: Record<string, string> = {};
      Object.keys(projectData).forEach(key => {
        const error = validateField(key, projectData[key as keyof ProjectFormData]);
        if (error) errors[key] = error;
      });

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    // Save current step data - only update the fields that have changed
    // Don't overwrite uploadedFiles or other step-specific data
    try {
      // Only update the current step's data, preserve other step data
      const dataToUpdate: Partial<ProjectFormData> = {};
      
      // Only include fields that are part of the current step
      if (currentStep === 1) {
        // Step 1: Project Details
        dataToUpdate.projectName = projectData.projectName;
        dataToUpdate.projectDescription = projectData.projectDescription;
        dataToUpdate.buildingType = projectData.buildingType;
        dataToUpdate.squareFootage = projectData.squareFootage;
        dataToUpdate.numberOfFloors = projectData.numberOfFloors;
        dataToUpdate.numberOfZones = projectData.numberOfZones;
        dataToUpdate.clientName = projectData.clientName;
        dataToUpdate.clientEmail = projectData.clientEmail;
        dataToUpdate.clientPhone = projectData.clientPhone;
        dataToUpdate.projectLocation = projectData.projectLocation;
        dataToUpdate.estimatedStartDate = projectData.estimatedStartDate;
        dataToUpdate.estimatedEndDate = projectData.estimatedEndDate;
        dataToUpdate.budget = projectData.budget;
        dataToUpdate.priority = projectData.priority;
      }
      // For other steps, don't update projectData to preserve uploadedFiles
      
      await updateSession(dataToUpdate, currentStep);
      
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Failed to save step data:', error);
      // Continue anyway, don't block user progress
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Don't update session when going back, just change the step
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!projectData) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submit clicked - Current completedSteps:', completedSteps);
      console.log('Submit clicked - Current projectData:', projectData);
      
      // Add current step (step 4) to completedSteps if not already there
      const updatedCompletedSteps = completedSteps.includes(4) ? completedSteps : [...completedSteps, 4];
      console.log('Submit clicked - Updated completedSteps:', updatedCompletedSteps);
      
      // Validate all steps are complete
      if (updatedCompletedSteps.length < 4) {
        const missingSteps = [];
        for (let i = 1; i <= 4; i++) {
          if (!updatedCompletedSteps.includes(i)) {
            missingSteps.push(i);
          }
        }
        
        const stepNames = {
          1: 'Project Details',
          2: 'Requirements', 
          3: 'Data Sources',
          4: 'Review & Create'
        };
        
        const missingStepNames = missingSteps.map(step => stepNames[step as keyof typeof stepNames]).join(', ');
        
        console.log('Submit clicked - Missing steps:', missingSteps);
        console.log('Submit clicked - Missing step names:', missingStepNames);
        
        throw new Error(`Please complete the following steps before creating the project: ${missingStepNames}`);
      }

      // Update session with step 4 completed
      if (!completedSteps.includes(4)) {
        console.log('Submit clicked - Adding step 4 to completedSteps');
        await updateSession({}, 4);
      }

      // Save to permanent database
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const result = await response.json();
      
      // Clear session after successful creation
      await clearSession();
      
      // Redirect to projects dashboard with success message
      router.push('/projects?success=true');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Project Details', description: 'Basic project information' },
    { id: 2, title: 'Requirements', description: 'Upload documents & specifications' },
    { id: 3, title: 'Data Sources', description: 'Connect to business systems' },
    { id: 4, title: 'Review & Create', description: 'Review and create project' }
  ];

  // Show loading state while session is loading
  if (sessionLoading && !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">Session Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => createSession()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    if (!projectData) return null;
    
    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep 
          projectData={projectData} 
          onInputChange={handleInputChange}
          validationErrors={validationErrors}
          onBlur={handleBlur}
        />;
      case 2:
        return <RequirementsStep 
          projectData={projectData}
          updateSession={updateSession}
          loading={sessionLoading}
        />;
      case 3:
        return <DataSourcesStep 
          projectData={projectData}
          updateSession={updateSession}
          loading={sessionLoading}
        />;
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
                {/* Session Status Indicator */}
                {sessionId && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${sessionLoading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {sessionLoading ? 'Saving...' : 'Auto-saved'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      Session: {sessionId.slice(0, 8)}...
                    </span>
                  </div>
                )}
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
                    disabled={!canProceedToNext()}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
const ProjectDetailsStep: React.FC<{ 
  projectData: ProjectFormData; 
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationErrors: Record<string, string>;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}> = ({ projectData, onInputChange, validationErrors, onBlur }) => {
  const getFieldError = (fieldName: string) => validationErrors[fieldName];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Information</h2>
        <p className="text-gray-600">Enter the essential details for your fire & security system project.</p>
      </div>

      {/* Project Details Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Basic Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={projectData.projectName}
              onChange={onInputChange}
              onBlur={onBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                getFieldError('projectName') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Downtown Office Building Fire System"
              maxLength={100}
            />
            {getFieldError('projectName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('projectName')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building Type <span className="text-red-500">*</span>
            </label>
            <select
              name="buildingType"
              value={projectData.buildingType}
              onChange={onInputChange}
              onBlur={onBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                getFieldError('buildingType') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
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
              <option value="hospitality">Hospitality</option>
              <option value="government">Government</option>
              <option value="other">Other</option>
            </select>
            {getFieldError('buildingType') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('buildingType')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="squareFootage"
                value={projectData.squareFootage || ''}
                onChange={onInputChange}
                onBlur={onBlur}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  getFieldError('squareFootage') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
                min="1"
                max="1000000"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 text-sm">sq ft</span>
              </div>
            </div>
            {getFieldError('squareFootage') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('squareFootage')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Floors
            </label>
            <input
              type="number"
              name="numberOfFloors"
              value={projectData.numberOfFloors || ''}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="1"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Client Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              name="clientName"
              value={projectData.clientName}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              onBlur={onBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                getFieldError('clientEmail') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="client@example.com"
            />
            {getFieldError('clientEmail') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('clientEmail')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Phone
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={projectData.clientPhone}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="(555) 123-4567"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter project address or location"
            />
          </div>
        </div>
      </div>

      {/* Project Timeline & Budget Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Timeline & Budget</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Start Date
            </label>
            <input
              type="date"
              name="estimatedStartDate"
              value={projectData.estimatedStartDate}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated End Date
            </label>
            <input
              type="date"
              name="estimatedEndDate"
              value={projectData.estimatedEndDate}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Priority
            </label>
            <select
              name="priority"
              value={projectData.priority}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (Optional)
          </label>
          <div className="relative">
            <input
              type="number"
              name="budget"
              value={projectData.budget || ''}
              onChange={onInputChange}
              onBlur={onBlur}
              className={`w-full px-4 py-3 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                getFieldError('budget') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 text-sm">$</span>
            </div>
          </div>
          {getFieldError('budget') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('budget')}</p>
          )}
        </div>
      </div>

      {/* Project Description Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description
          </label>
          <textarea
            name="projectDescription"
            value={projectData.projectDescription}
            onChange={onInputChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Describe the project scope, specific requirements, compliance needs, and any special considerations..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Include details about fire safety requirements, security system needs, compliance standards, and any special considerations.
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Project Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Provide accurate project details to help our AI system generate precise estimates and recommendations for your fire & security system installation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataSourcesStep: React.FC<{ 
  projectData: ProjectFormData | null;
  updateSession: (data: Partial<ProjectFormData>, step?: number) => Promise<void>;
  loading: boolean;
}> = ({ projectData, updateSession, loading: sessionLoading }) => {
  const [aiSourcingEnabled, setAiSourcingEnabled] = React.useState(true);
  const [aiState, setAiState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [aiSamples, setAiSamples] = React.useState<any[]>([]);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [stepCompleted, setStepCompleted] = React.useState(false);

  // Simulate AI sourcing (replace with real API call)
  React.useEffect(() => {
    if (!aiSourcingEnabled || stepCompleted) return;
    setAiState('loading');
    setAiError(null);
    setTimeout(() => {
      // Simulate success or error
      if (Math.random() < 0.85) {
        setAiSamples([
          { code: 'SD-1001', description: 'Smoke Detector', price: 45.99, vendor: 'Graybar', source: 'Graybar API' },
          { code: 'FS-2002', description: 'Fire Alarm Panel', price: 399.0, vendor: 'Anixter', source: 'Fallback CSV' },
          { code: 'BX-3003', description: 'Backbox', price: 7.5, vendor: 'Graybar', source: 'Graybar API' },
        ]);
        setAiState('success');
        // Mark step 3 as completed when AI sourcing is successful
        console.log('DataSourcesStep: Marking step 3 as completed');
        setStepCompleted(true);
        updateSession({}, 3).catch(console.error);
      } else {
        setAiError('Vendor sourcing failed. Please check your network or configure a manual source.');
        setAiState('error');
      }
    }, 1800);
  }, [aiSourcingEnabled, stepCompleted]); // Remove updateSession from dependencies

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Data Sources</h2>
        <p className="text-sm text-gray-600">Connect to your business systems or let AI recommend vendors and materials for your project.</p>
      </div>

      {/* AI Sourcing Toggle */}
      <div className="flex items-center space-x-3 mb-2">
        <input
          id="ai-sourcing-toggle"
          type="checkbox"
          checked={aiSourcingEnabled}
          onChange={() => setAiSourcingEnabled(v => !v)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <label htmlFor="ai-sourcing-toggle" className="text-sm text-gray-800 font-medium">
          Allow AI agent to source vendors, details, and materials as per project requirements
        </label>
      </div>

      {/* AI Vendor Discovery Panel */}
      {aiSourcingEnabled && (
        <div className="my-4">
          {/* Loading/Progress State */}
          {aiState === 'loading' && (
            <div role="status" className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-2 animate-fade-in-slide-down">
              <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              <span className="text-blue-900 text-sm">Vendor Sourcing: finding best prices for smoke detectors…</span>
            </div>
          )}
          {/* Error State */}
          {aiState === 'error' && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-2 flex items-center animate-fade-in-slide-down">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="text-red-800 text-sm">{aiError}</span>
              <button onClick={() => setAiState('loading')} className="ml-4 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Retry</button>
              <button className="ml-2 px-3 py-1 text-xs underline text-blue-700 hover:bg-blue-50 rounded">Configure Manual Source</button>
            </div>
          )}
          {/* Success/Preview State */}
          {aiState === 'success' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-fade-in-slide-down">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🤖</span>
                <h3 className="text-base font-semibold text-gray-900">AI-Sourced Sample SKUs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Code</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Unit Price</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Vendor</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiSamples.map((row, i) => (
                      <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-mono">{row.code}</td>
                        <td className="px-3 py-2">{row.description}</td>
                        <td className="px-3 py-2">${row.price.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-1 border border-blue-200 rounded text-xs text-blue-800 bg-blue-50 cursor-pointer hover:shadow" title={row.source}>{row.vendor}</span>
                        </td>
                        <td className="px-3 py-2">
                          <button className="text-xs text-blue-600 underline hover:text-blue-800">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button className="text-xs underline text-blue-700 hover:bg-blue-50 rounded px-2 py-1" onClick={() => setAiState('loading')}>Refresh samples</button>
                <button className="text-xs underline text-blue-700 hover:bg-blue-50 rounded px-2 py-1">Configure manual connectors</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Data Source Connectors */}
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

const RequirementsStep: React.FC<{ 
  projectData: ProjectFormData | null;
  updateSession: (data: Partial<ProjectFormData>, step?: number) => Promise<void>;
  loading: boolean;
}> = ({ projectData, updateSession, loading: sessionLoading }) => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load uploaded files from session on component mount and when session data changes
  useEffect(() => {
    console.log('RequirementsStep: projectData changed', projectData);
    console.log('RequirementsStep: current uploadedFiles state', uploadedFiles);
    if (projectData?.uploadedFiles && projectData.uploadedFiles.length > 0) {
      console.log('Loading uploaded files from session:', projectData.uploadedFiles);
      setUploadedFiles(projectData.uploadedFiles);
    } else if (projectData && !projectData.uploadedFiles) {
      // Clear files if session data is loaded but no files exist
      console.log('No uploaded files in session, clearing local state');
      setUploadedFiles([]);
    }
  }, [projectData?.uploadedFiles]); // Only depend on uploadedFiles, not entire projectData

  // Mark step as completed when files are uploaded - but only if not already completed
  useEffect(() => {
    if (uploadedFiles.length > 0 && uploadedFiles.every(file => file.status === 'success')) {
      console.log('RequirementsStep: Marking step 2 as completed');
      // Only update if we haven't already marked this step as completed
      updateSession({ uploadedFiles }, 2).catch(console.error);
    }
  }, [uploadedFiles]); // Remove updateSession from dependencies to prevent infinite loop

  // Show loading state while session is loading
  if (sessionLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Requirements</h2>
          <p className="text-sm text-gray-600">Loading session data...</p>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-600">Loading uploaded files...</p>
        </div>
      </div>
    );
  }

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = async (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    // Update session
    console.log('Removing file, updating session with files:', updatedFiles);
    await updateSession({
      uploadedFiles: updatedFiles
    });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Requirements</h2>
        <p className="text-sm text-gray-600">Upload project documents and specifications for AI processing.</p>
      </div>

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
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <h3 className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-sm text-gray-600">or click to browse files</p>
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
          <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
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

      {/* Document Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Document Processing</h4>
            <p className="text-sm text-blue-700 mt-1">
              Documents will be automatically processed to extract project requirements, specifications, and technical details for accurate estimation. Files are stored locally for development and will be processed by AI to extract relevant project information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{ projectData: ProjectFormData }> = ({ projectData }) => {
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

  // Get session data for debugging
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('projectSessionId') : null;

  // Debug function to manually mark all steps as completed
  const markAllStepsCompleted = async () => {
    try {
      const response = await fetch('/api/project-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          projectData: projectData,
          currentStep: 4,
          completedSteps: [1, 2, 3, 4]
        })
      });
      
      if (response.ok) {
        console.log('All steps marked as completed');
        window.location.reload(); // Refresh to see the updated state
      } else {
        console.error('Failed to mark steps as completed');
      }
    } catch (error) {
      console.error('Error marking steps as completed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Project Details</h2>
        <p className="text-sm text-gray-600">Review all project information before creating.</p>
      </div>

      {/* Debug Section - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">Debug Information</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>Session ID: {sessionId || 'None'}</p>
            <p>Project Name: {projectData.projectName || 'Not set'}</p>
            <p>Building Type: {projectData.buildingType || 'Not set'}</p>
            <p>Square Footage: {projectData.squareFootage || 'Not set'}</p>
            <p>Uploaded Files: {projectData.uploadedFiles?.length || 0} files</p>
            <p>Current Step: 4 (Review & Create)</p>
            <p>Note: Step 4 will be automatically marked as completed when you click "Create Project"</p>
          </div>
          <button
            onClick={markAllStepsCompleted}
            className="mt-3 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Debug: Mark All Steps Completed
          </button>
        </div>
      )}

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

      {/* Uploaded Files Section */}
      {projectData.uploadedFiles && projectData.uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Documents</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              {projectData.uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3">
                  <div className="text-xl">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  {file.status === 'success' && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              These documents will be processed by AI to extract project requirements and generate accurate cost estimates.
            </p>
          </div>
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