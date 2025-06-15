import React from 'react';
import { ExtractedDoc } from '../../types';

interface MetadataPanelProps {
  extractedDocs: ExtractedDoc[];
  projectDetails: any;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  extractedDocs,
  projectDetails
}) => {
  const allDevices = extractedDocs.flatMap(doc => doc.extractedData.devices || []);
  const deviceSummary = allDevices.reduce((acc: Record<string, number>, device: any) => {
    acc[device.type] = (acc[device.type] || 0) + device.count;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Summary</h3>
      
      <div className="space-y-6">
        {/* Building Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Building Overview</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Documents</span>
              <span className="font-medium text-gray-900">{extractedDocs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Building Type</span>
              <span className="font-medium text-gray-900">
                {projectDetails.buildingType || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Area</span>
              <span className="font-medium text-gray-900">
                {projectDetails.squareFootage ? `${projectDetails.squareFootage} sq ft` : 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Device Summary */}
        {Object.keys(deviceSummary).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Device Summary</h4>
            <div className="space-y-2">
              {Object.entries(deviceSummary).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-500">{type}</span>
                  <span className="font-medium text-gray-900">{count} units</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Types */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Document Types</h4>
          <div className="space-y-2">
            {Array.from(new Set(extractedDocs.map(d => d.detectedType))).map(type => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-500">{type}</span>
                <span className="font-medium text-gray-900">
                  {extractedDocs.filter(d => d.detectedType === type).length} files
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel; 