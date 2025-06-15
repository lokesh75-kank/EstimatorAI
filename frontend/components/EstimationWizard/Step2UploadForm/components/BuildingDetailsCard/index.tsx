import React from 'react';
import { motion } from 'framer-motion';
import ParsedFieldInput from '../ParsedFieldInput';
import { ExtractedData } from '../../types';

interface BuildingDetailsCardProps {
  data: ExtractedData;
  onEdit: (field: string, value: any) => void;
  isConfirmed: boolean;
}

const BuildingDetailsCard: React.FC<BuildingDetailsCardProps> = ({
  data,
  onEdit,
  isConfirmed
}) => {
  const details = [
    {
      key: 'project_type',
      label: 'Project Type',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      tooltip: 'Detected from document header',
      placeholder: 'e.g., Warehouse, Office Building',
      type: 'text'
    },
    {
      key: 'square_footage',
      label: 'Square Footage',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      tooltip: 'Detected from floor plan scale',
      placeholder: 'e.g., 5000',
      type: 'number',
      suffix: 'sq ft'
    },
    {
      key: 'floors',
      label: 'Number of Floors',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
        </svg>
      ),
      tooltip: 'Detected from elevation view',
      placeholder: 'e.g., 3',
      type: 'number',
      suffix: 'floors'
    },
    {
      key: 'zones',
      label: 'Number of Zones',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      tooltip: 'Detected from zoning diagram',
      placeholder: 'e.g., 5',
      type: 'number',
      suffix: 'zones'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Building Details
        </h5>
        <p className="text-sm text-gray-600 mt-1">
          Key specifications extracted from your documents
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {details.map(({ key, label, icon, tooltip, placeholder, type, suffix }) => (
            <div key={key} className="relative">
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <label className="font-medium text-gray-700">{label}</label>
                {tooltip && (
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {isConfirmed ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {data[key] || 'Not specified'}
                  </span>
                  {suffix && data[key] && (
                    <span className="text-sm text-gray-500">{suffix}</span>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type={type}
                    value={data[key] || ''}
                    onChange={(e) => onEdit(key, type === 'number' ? parseInt(e.target.value) : e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {suffix && data[key] && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {suffix}
                    </span>
                  )}
                </div>
              )}

              {!isConfirmed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -right-2 -top-2"
                >
                  <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-100">
                    Editable
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {!isConfirmed && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click on any field to edit the extracted information</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingDetailsCard; 