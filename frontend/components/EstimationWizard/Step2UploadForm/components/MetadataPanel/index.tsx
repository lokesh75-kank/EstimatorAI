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
  const allDevices = extractedDocs.flatMap(doc => doc?.extractedData?.devices || []);
  const deviceSummary = allDevices.reduce((acc: Record<string, number>, device: any) => {
    acc[device.type] = (acc[device.type] || 0) + device.count;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900">Project Summary</h5>
      </div>

      <div className="p-6 space-y-6">
        {/* Building Details */}
        <div>
          <h6 className="text-sm font-medium text-gray-700 mb-3">Building Details</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium text-gray-900">{projectDetails?.buildingType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Square Footage</p>
              <p className="font-medium text-gray-900">{projectDetails?.squareFootage || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floors</p>
              <p className="font-medium text-gray-900">{projectDetails?.numberOfFloors || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Zones</p>
              <p className="font-medium text-gray-900">{projectDetails?.numberOfZones || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Device Summary */}
        {Object.keys(deviceSummary).length > 0 && (
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-3">Device Summary</h6>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(deviceSummary).map(([type, count]) => (
                <div key={type}>
                  <p className="text-sm text-gray-500">{type}</p>
                  <p className="font-medium text-gray-900">{count} units</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Summary */}
        <div>
          <h6 className="text-sm font-medium text-gray-700 mb-3">Documents Processed</h6>
          <div className="space-y-2">
            {extractedDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{doc.documentType?.startsWith('image') ? '🖼️' : '📄'}</span>
                  <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                </div>
                <span className="text-sm text-gray-500">{doc.detectedType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel; 