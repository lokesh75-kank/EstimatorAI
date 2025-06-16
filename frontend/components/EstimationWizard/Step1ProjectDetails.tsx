import React, { useState } from 'react';

interface Step1ProjectDetailsProps {
  projectDetails: any;
  setProjectDetails: (val: any) => void;
  error: string | null;
  setError: (val: string | null) => void;
}

const Step1ProjectDetails: React.FC<Step1ProjectDetailsProps> = ({ projectDetails, setProjectDetails, error, setError }) => {
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectDetails((prev: any) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const validate = (field: string) => {
    if (!touched[field]) return '';
    if (field === 'projectName' && !projectDetails.projectName) return 'Project name is required.';
    if (field === 'clientContact' && !projectDetails.clientContact) return 'Client contact is required.';
    if (field === 'deadline' && !projectDetails.deadline) return 'Deadline is required.';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
        <p className="text-gray-500 mb-6">Enter the basic information for your new estimate. Required fields are marked with <span className="text-red-500">*</span>.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        
        {/* Building Details Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏢</span> Building Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buildingType"
                value={projectDetails.buildingType || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Commercial, Residential, Industrial"
                required
              />
              {projectDetails._autoFilledBuildingType && (
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="mr-1">✓</span> Auto-filled from document analysis
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Footage <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="squareFootage"
                value={projectDetails.squareFootage || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 50000"
                min={0}
                required
              />
              {projectDetails._autoFilledSquareFootage && (
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <span className="mr-1">✓</span> Auto-filled from document analysis
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Information Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span> Project Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="projectName"
                value={projectDetails.projectName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project Name"
                required
              />
              {validate('projectName') && (
                <div className="text-xs text-red-500 mt-1">{validate('projectName')}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deadline"
                value={projectDetails.deadline || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {validate('deadline') && (
                <div className="text-xs text-red-500 mt-1">{validate('deadline')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👥</span> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientContact"
                value={projectDetails.clientContact || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Client Contact (name, email, or phone)"
                required
              />
              {validate('clientContact') && (
                <div className="text-xs text-red-500 mt-1">{validate('clientContact')}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={projectDetails.address || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Address"
              />
            </div>
          </div>
        </div>

        {/* Company Information Card */}
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏢</span> Company Information
            <span className="ml-2 text-xs text-gray-400">(optional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={projectDetails.companyName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="text"
                name="companyLogo"
                value={projectDetails.companyLogo || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Logo URL (optional)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectDetails; 