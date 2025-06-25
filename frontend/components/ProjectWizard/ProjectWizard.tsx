import React, { useState, useEffect } from 'react';
import { ProjectFormData } from './types';
import { 
  Step1ProjectDetails, 
  Step2Requirements, 
  Step3DataSources, 
  Step4Review 
} from './steps';

interface ProjectWizardProps {
  onComplete?: (projectData: ProjectFormData) => void;
}

const ProjectWizard: React.FC<ProjectWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectFormData>({
    projectName: '',
    projectDescription: '',
    buildingType: '',
    squareFootage: 0,
    numberOfFloors: 1,
    numberOfZones: 1,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectLocation: '',
    estimatedStartDate: '',
    estimatedEndDate: '',
    budget: 0,
    priority: 'medium',
    uploadedFiles: [],
    aiAnalysis: undefined
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/project-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData, currentStep: 1, completedSteps: [] })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        localStorage.setItem('projectSessionId', data.sessionId);
        
        if (data.projectData) {
          setProjectData(data.projectData);
        }
        if (data.currentStep) {
          setCurrentStep(data.currentStep);
        }
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (data: Partial<ProjectFormData>, step?: number) => {
    try {
      const updatedData = { ...projectData, ...data };
      setProjectData(updatedData);

      const response = await fetch('/api/project-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          projectData: updatedData,
          currentStep: step || currentStep,
          completedSteps: step ? Array.from({ length: step }, (_, i) => i + 1) : undefined
        })
      });

      if (!response.ok) {
        console.error('Failed to update session');
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'projectName':
        return !value || value.trim() === '' ? 'Project name is required' : '';
      case 'buildingType':
        return !value || value.trim() === '' ? 'Building type is required' : '';
      case 'squareFootage':
        return !value || value <= 0 ? 'Square footage must be greater than 0' : '';
      case 'clientEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'budget':
        if (value && value < 0) {
          return 'Budget cannot be negative';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setProjectData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    const error = validateField(name, parsedValue);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return projectData.projectName && 
               projectData.buildingType && 
               projectData.squareFootage > 0 &&
               !Object.values(validationErrors).some(error => error);
      case 2:
        return projectData.uploadedFiles && projectData.uploadedFiles.length > 0;
      case 3:
        return true; // Data sources step is optional
      case 4:
        return true; // Review step is always accessible
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceedToNext()) return;

    if (currentStep === 2) {
      // Process uploaded files with AI when moving from step 2 to 3
      if (projectData.uploadedFiles && projectData.uploadedFiles.length > 0) {
        try {
          setLoading(true);
          
          // Process each uploaded file
          for (const file of projectData.uploadedFiles) {
            if (file.status === 'success') {
              const fileType = file.type;
              const isImage = fileType.startsWith('image/');
              
              if (isImage) {
                // Process image with vision model
                const imageResponse = await fetch('/api/documents/process-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    fileName: file.name,
                    sessionId 
                  })
                });
                
                if (imageResponse.ok) {
                  const imageResult = await imageResponse.json();
                  console.log('DEBUG: Full image processing backend response:', imageResult);
                  // Normalize keys
                  const aiAnalysis = imageResult.aiAnalysis || imageResult.extractedData || {};
                  aiAnalysis.estimationElements = aiAnalysis.estimationElements || aiAnalysis.estimation_elements || [];
                  aiAnalysis.vendors = aiAnalysis.vendors || aiAnalysis.vendors || [];
                  aiAnalysis.materials = aiAnalysis.materials || aiAnalysis.materials || [];
                  aiAnalysis.recommendations = aiAnalysis.recommendations || aiAnalysis.recommendations || [];
                  aiAnalysis.projectDetails = aiAnalysis.projectDetails || aiAnalysis.projectDetails || {};
                  await updateSession({
                    aiAnalysis
                  });
                }
              } else {
                // Process document with text model
                const docResponse = await fetch('/api/documents/process-document', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    fileName: file.name,
                    sessionId 
                  })
                });
                
                if (docResponse.ok) {
                  const docResult = await docResponse.json();
                  console.log('Document processing result:', docResult);
                  // Normalize keys
                  const aiAnalysis = docResult.aiAnalysis || docResult.extractedData || {};
                  aiAnalysis.estimationElements = aiAnalysis.estimationElements || aiAnalysis.estimation_elements || [];
                  aiAnalysis.vendors = aiAnalysis.vendors || aiAnalysis.vendors || [];
                  aiAnalysis.materials = aiAnalysis.materials || aiAnalysis.materials || [];
                  aiAnalysis.recommendations = aiAnalysis.recommendations || aiAnalysis.recommendations || [];
                  aiAnalysis.projectDetails = aiAnalysis.projectDetails || aiAnalysis.projectDetails || {};
                  await updateSession({
                    aiAnalysis
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing files with AI:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    await updateSession({}, nextStep);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateSession({}, prevStep);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Project created successfully:', result);
        
        // Clear session
        localStorage.removeItem('projectSessionId');
        
        // Call onComplete callback
        if (onComplete) {
          onComplete(projectData);
        }
        
        // Redirect to the new project
        window.location.href = `/projects/${result.id}`;
      } else {
        console.error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProjectDetails
            projectData={projectData}
            onInputChange={handleInputChange}
            validationErrors={validationErrors}
            onBlur={handleBlur}
          />
        );
      case 2:
        return (
          <Step2Requirements
            projectData={projectData}
            updateSession={updateSession}
            loading={loading}
          />
        );
      case 3:
        return (
          <Step3DataSources
            projectData={projectData}
            updateSession={updateSession}
            loading={loading}
          />
        );
      case 4:
        return (
          <Step4Review
            projectData={projectData}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  const steps = [
    { number: 1, title: 'Project Details', description: 'Basic project information' },
    { number: 2, title: 'Requirements', description: 'Upload project documents' },
    { number: 3, title: 'Data Sources', description: 'AI analysis & vendors' },
    { number: 4, title: 'Review', description: 'Review & create project' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg border transition-colors ${
            currentStep === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Back
        </button>

        <div className="flex space-x-3">
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceedToNext() || loading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                !canProceedToNext() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Next'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard; 