"use client";

import React, { useState } from 'react';
import { DataSourceFormData } from '@/types/dataSources';
import { Step1ChooseType } from './wizard/Step1ChooseType';
import { Step2ConnectionDetails } from './wizard/Step2ConnectionDetails';
import { Step3FieldMapping } from './wizard/Step3FieldMapping';
import { Step4CacheSync } from './wizard/Step4CacheSync';
import { Step5ReviewTest } from './wizard/Step5ReviewTest';

interface AddSourceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (dataSource: DataSourceFormData) => void;
}

export const AddSourceWizard: React.FC<AddSourceWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DataSourceFormData>({
    name: '',
    type: 'sql',
    description: '',
    connectionDetails: {},
    fieldMappings: [],
    syncSettings: {
      syncType: 'batch',
      cacheTTL: 3600,
      enabled: true
    }
  });

  const steps = [
    { id: 1, title: 'Choose Type', description: 'Select data source type' },
    { id: 2, title: 'Connection', description: 'Configure connection details' },
    { id: 3, title: 'Field Mapping', description: 'Map vendor fields' },
    { id: 4, title: 'Sync & Cache', description: 'Configure sync settings' },
    { id: 5, title: 'Review & Test', description: 'Review and test configuration' }
  ];

  const handleStepComplete = (stepData: Partial<DataSourceFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (testResult: any) => {
    if (testResult.success) {
      onComplete(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      type: 'sql',
      description: '',
      connectionDetails: {},
      fieldMappings: [],
      syncSettings: {
        syncType: 'batch',
        cacheTTL: 3600,
        enabled: true
      }
    });
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ChooseType
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleClose}
          />
        );
      case 2:
        return (
          <Step2ConnectionDetails
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );
      case 3:
        return (
          <Step3FieldMapping
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );
      case 4:
        return (
          <Step4CacheSync
            formData={formData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );
      case 5:
        return (
          <Step5ReviewTest
            formData={formData}
            onComplete={handleComplete}
            onBack={handleStepBack}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Add Data Source</h3>
                <p className="text-sm text-gray-600">Configure a new data source for your estimations</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <nav aria-label="Progress">
                <ol className="flex items-center">
                  {steps.map((step, stepIdx) => (
                    <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-10' : ''}`}>
                      <div className="flex items-center">
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
                          step.id < currentStep
                            ? 'bg-blue-600'
                            : step.id === currentStep
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}>
                          {step.id < currentStep ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className={`text-sm font-medium ${
                              step.id === currentStep ? 'text-white' : 'text-gray-500'
                            }`}>
                              {step.id}
                            </span>
                          )}
                        </div>
                        {stepIdx !== steps.length - 1 && (
                          <div className={`absolute top-4 w-full h-0.5 ${
                            step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className={`text-xs font-medium ${
                          step.id === currentStep ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
}; 