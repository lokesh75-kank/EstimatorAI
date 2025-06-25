import React from 'react';
import { ProjectFormData } from '../types';

interface Step1ProjectDetailsProps {
  projectData: ProjectFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationErrors: Record<string, string>;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Step1ProjectDetails: React.FC<Step1ProjectDetailsProps> = ({ 
  projectData, 
  onInputChange, 
  validationErrors, 
  onBlur 
}) => {
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
              step="1000"
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
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description
          </label>
          <textarea
            name="projectDescription"
            value={projectData.projectDescription}
            onChange={onInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Describe the project scope, requirements, and any special considerations..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectDetails; 