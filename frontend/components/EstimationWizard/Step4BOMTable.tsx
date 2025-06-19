import React, { useState, useEffect } from 'react';
import EstimationDashboard from '@/components/estimates/EstimationDashboard';
import { ProjectParams } from '@/services/estimationService';

interface Step4BOMTableProps {
  bomData: any[];
  setBOMData: (val: any[]) => void;
  warnings: string[];
  setWarnings: (val: string[]) => void;
  projectDetails: any;
}

const Step4BOMTable: React.FC<Step4BOMTableProps> = ({ 
  bomData, 
  setBOMData, 
  warnings, 
  setWarnings,
  projectDetails 
}) => {
  const [projectParams, setProjectParams] = useState<ProjectParams>({
    projectName: projectDetails.projectName || 'New Project',
    buildingType: projectDetails.buildingType || 'office_building',
    squareFootage: projectDetails.squareFootage || 0,
    numberOfFloors: projectDetails.numberOfFloors || 1,
    numberOfZones: projectDetails.numberOfZones || 1,
    location: {
      state: projectDetails.state,
      zip_code: projectDetails.zipCode
    },
    special_features: projectDetails.specialFeatures || [],
    overrides: {}
  });

  const handleEstimationComplete = (estimation: any) => {
    // Update the parent component's state
    setBOMData(estimation.bomItems);
    setWarnings(estimation.warnings);
  };

  // Update project params when project details change
  useEffect(() => {
    setProjectParams({
      projectName: projectDetails.projectName || 'New Project',
      buildingType: projectDetails.buildingType || 'office_building',
      squareFootage: projectDetails.squareFootage || 0,
      numberOfFloors: projectDetails.numberOfFloors || 1,
      numberOfZones: projectDetails.numberOfZones || 1,
      location: {
        state: projectDetails.state,
        zip_code: projectDetails.zipCode
      },
      special_features: projectDetails.specialFeatures || [],
      overrides: {}
    });
  }, [projectDetails]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">BOM/Compliance Review</h2>
        <div className="text-sm text-gray-600">
          Review and adjust your bill of materials
        </div>
      </div>
      
      <EstimationDashboard
        projectParams={projectParams}
        onEstimationComplete={handleEstimationComplete}
      />
    </div>
  );
};

export default Step4BOMTable; 