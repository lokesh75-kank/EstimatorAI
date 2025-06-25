import React from 'react';
import { ProjectFormData } from '../types';

interface Step4ReviewProps {
  projectData: ProjectFormData;
}

const Step4Review: React.FC<Step4ReviewProps> = ({ projectData }) => {
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

export default Step4Review; 