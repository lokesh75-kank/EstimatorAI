"use client";

import React, { useState } from 'react';
import { DataSourceFormData, DataSourceType } from '@/types/dataSources';

interface Step1ChooseTypeProps {
  formData: DataSourceFormData;
  onComplete: (stepData: Partial<DataSourceFormData>) => void;
  onBack: () => void;
}

export const Step1ChooseType: React.FC<Step1ChooseTypeProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [selectedType, setSelectedType] = useState<DataSourceType>(formData.type);
  const [sourceName, setSourceName] = useState(formData.name);

  const sourceTypes = [
    {
      type: 'sql' as DataSourceType,
      icon: '🗄️',
      title: 'SQL Database',
      description: 'Connect to MySQL, PostgreSQL, SQL Server, or Oracle databases',
      features: ['Real-time data access', 'Structured queries', 'ACID compliance']
    },
    {
      type: 'rest' as DataSourceType,
      icon: '🌐',
      title: 'REST API',
      description: 'Connect to vendor APIs and web services',
      features: ['HTTP/HTTPS support', 'JSON/XML parsing', 'Authentication support']
    },
    {
      type: 'file' as DataSourceType,
      icon: '📁',
      title: 'File Upload',
      description: 'Import CSV, Excel, or JSON files from local or cloud storage',
      features: ['Multiple formats', 'Cloud storage support', 'Batch processing']
    }
  ];

  const handleNext = () => {
    if (selectedType && sourceName.trim()) {
      onComplete({
        type: selectedType,
        name: sourceName.trim()
      });
    }
  };

  const isNextDisabled = !selectedType || !sourceName.trim();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Source Type</h3>
        <p className="text-sm text-gray-600">
          Select the type of data source you want to connect to.
        </p>
      </div>

      {/* Source Name Input */}
      <div>
        <label htmlFor="sourceName" className="block text-sm font-medium text-gray-700 mb-2">
          Source Name
        </label>
        <input
          type="text"
          id="sourceName"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="e.g., ACME Fire Supplies Database"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Give your data source a descriptive name for easy identification.
        </p>
      </div>

      {/* Source Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Data Source Type
        </label>
        <div className="grid grid-cols-1 gap-4">
          {sourceTypes.map((sourceType) => (
            <div
              key={sourceType.type}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                selectedType === sourceType.type
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedType(sourceType.type)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{sourceType.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {sourceType.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {sourceType.description}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {sourceType.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-500">
                        <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedType === sourceType.type && (
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
          disabled={isNextDisabled}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 