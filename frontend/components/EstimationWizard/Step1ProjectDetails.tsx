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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
      <p className="text-gray-500 mb-6">Enter the basic information for your new estimate. Required fields are marked with <span className="text-red-500">*</span>.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <div className="space-y-6">
        <div>
          <label className="form-label font-semibold">Project Name <span className="text-red-500">*</span></label>
          <input type="text" name="projectName" value={projectDetails.projectName} onChange={handleInputChange} onBlur={handleBlur} className="input-field" placeholder="Project Name" required />
          {validate('projectName') && <div className="text-xs text-red-500 mt-1">{validate('projectName')}</div>}
        </div>
        <div>
          <label className="form-label font-semibold">Building Type <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="buildingType"
            value={projectDetails.buildingType || ''}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g. Commercial, Residential, Industrial"
            required
          />
          {projectDetails._autoFilledBuildingType && (
            <div className="text-xs text-green-600 mt-1">Auto-filled from document analysis. Please confirm or edit.</div>
          )}
        </div>
        <div>
          <label className="form-label font-semibold">Square Footage <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="squareFootage"
            value={projectDetails.squareFootage || ''}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g. 50000"
            min={0}
            required
          />
          {projectDetails._autoFilledSquareFootage && (
            <div className="text-xs text-green-600 mt-1">Auto-filled from document analysis. Please confirm or edit.</div>
          )}
        </div>
        <div>
          <label className="form-label font-semibold">Address</label>
          <input type="text" name="address" value={projectDetails.address || ''} onChange={handleInputChange} onBlur={handleBlur} className="input-field" placeholder="Address" />
        </div>
        <div>
          <label className="form-label font-semibold">Client Contact <span className="text-red-500">*</span></label>
          <input type="text" name="clientContact" value={projectDetails.clientContact || ''} onChange={handleInputChange} onBlur={handleBlur} className="input-field" placeholder="Client Contact (name, email, or phone)" required />
          {validate('clientContact') && <div className="text-xs text-red-500 mt-1">{validate('clientContact')}</div>}
        </div>
        <div>
          <label className="form-label font-semibold">Deadline <span className="text-red-500">*</span></label>
          <input type="date" name="deadline" value={projectDetails.deadline || ''} onChange={handleInputChange} onBlur={handleBlur} className="input-field" required />
          {validate('deadline') && <div className="text-xs text-red-500 mt-1">{validate('deadline')}</div>}
        </div>
        <div className="pt-4 border-t border-gray-100">
          <label className="form-label font-semibold">Company Info <span className="text-xs text-gray-400">(optional)</span></label>
          <input type="text" name="companyName" value={projectDetails.companyName || ''} onChange={handleInputChange} className="input-field" placeholder="Company Name" />
          <input type="text" name="companyLogo" value={projectDetails.companyLogo || ''} onChange={handleInputChange} className="input-field mt-2" placeholder="Logo URL (optional)" />
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectDetails; 