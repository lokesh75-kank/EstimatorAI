"use client";

import React from 'react';
import ProjectWizard from '@/components/ProjectWizard/ProjectWizard';
import { ProjectFormData } from '@/components/ProjectWizard/types';

const CreateProjectPage: React.FC = () => {
  const handleProjectComplete = (projectData: ProjectFormData) => {
    console.log('Project creation completed:', projectData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">
            Set up a new fire & security system project with AI-powered estimation.
          </p>
        </div>
        
        <ProjectWizard onComplete={handleProjectComplete} />
      </div>
    </div>
  );
};

export default CreateProjectPage; 