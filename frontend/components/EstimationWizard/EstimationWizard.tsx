"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1ProjectDetails from './Step1ProjectDetails';
import Step2UploadForm from './Step2UploadForm';
import Step3AutoFillForm from './Step3AutoFillForm';
import Step4BOMTable from './Step4BOMTable';
import Step5ProposalPreview from './Step5ProposalPreview';
import { apiService } from '@/services/api';
import axios from 'axios';

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
  const [extractedDocs, setExtractedDocs] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [bomData, setBOMData] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [proposalData, setProposalData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    try {
      // Log the current state before proceeding
      console.log('Current wizard state:', {
        currentStep,
        projectDetails,
        validationErrors
      });

      // Validate current step
      const stepValidation = validateStep(currentStep);
      if (!stepValidation.isValid) {
        setValidationErrors(stepValidation.errors);
        console.error('Step validation failed:', stepValidation.errors);
        return;
      }

      // If it's the last step, submit the form
      if (currentStep === 5) {
        setIsSubmitting(true);
        try {
          const response = await axios.post('/api/estimations', {
            projectDetails,
            extractedDocs,
            suggestions,
            bomData,
            warnings,
            proposalData
          });
          console.log('Estimation submitted successfully:', response.data);
          router.push('/dashboard');
        } catch (error) {
          console.error('Error submitting estimation:', {
            error,
            response: error.response?.data,
            status: error.response?.status,
            projectDetails,
            extractedDocs,
            suggestions,
            bomData,
            warnings,
            proposalData
          });
          setError('Failed to submit estimation. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      // Move to next step
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
    } catch (error) {
      console.error('Error in handleNext:', {
        error,
        currentStep,
        projectDetails,
        extractedDocs,
        suggestions,
        bomData,
        warnings,
        proposalData
      });
      setError('An unexpected error occurred. Please try again.');
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
    { id: 1, title: 'Project Details' },
    { id: 2, title: 'Upload Documents' },
    { id: 3, title: 'Review Auto-Fill' },
    { id: 4, title: 'BOM/Compliance Review' },
    { id: 5, title: 'Proposal' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ProjectDetails projectDetails={projectDetails} setProjectDetails={setProjectDetails} error={error} setError={setError} />;
      case 2:
        return <Step2UploadForm 
          extractedDocs={extractedDocs}
          setExtractedDocs={setExtractedDocs}
          setIsSubmitting={setIsSubmitting}
          setError={setError}
          isSubmitting={isSubmitting}
          error={error}
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
        />;
      case 3:
        return <Step3AutoFillForm extractedDocs={extractedDocs} projectDetails={projectDetails} setProjectDetails={setProjectDetails} suggestions={suggestions} setSuggestions={setSuggestions} />;
      case 4:
        return <Step4BOMTable bomData={bomData} setBOMData={setBOMData} warnings={warnings} setWarnings={setWarnings} />;
      case 5:
        return <Step5ProposalPreview proposalData={proposalData} setProposalData={setProposalData} />;
      default:
        return null;
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    
    // Log validation attempt
    console.log(`Validating step ${step}:`, projectDetails);

    switch (step) {
      case 0: // Project Details
        if (!projectDetails.projectName?.trim()) {
          errors.projectName = 'Project name is required';
        }
        if (!projectDetails.buildingType) {
          errors.buildingType = 'Building type is required';
        }
        if (!projectDetails.squareFootage) {
          errors.squareFootage = 'Square footage is required';
        }
        break;
      case 1: // Building Details
        if (!projectDetails.buildingType) {
          errors.buildingType = 'Building type is required';
        }
        if (!projectDetails.squareFootage) {
          errors.squareFootage = 'Square footage is required';
        }
        break;
      case 2: // Upload Documents
        if (extractedDocs.length === 0) {
          errors.extractedDocs = 'At least one document is required';
        }
        break;
      case 3: // Review Auto-Fill
        if (suggestions.length === 0) {
          errors.suggestions = 'At least one suggestion is required';
        }
        break;
      case 4: // BOM/Compliance Review
        if (bomData.length === 0) {
          errors.bomData = 'At least one BOM item is required';
        }
        break;
      case 5: // Proposal
        if (!proposalData.title?.trim()) {
          errors.proposalTitle = 'Proposal title is required';
        }
        if (!proposalData.description?.trim()) {
          errors.proposalDescription = 'Proposal description is required';
        }
        break;
    }

    // Log validation results
    console.log(`Step ${step} validation results:`, {
      isValid: Object.keys(errors).length === 0,
      errors
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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