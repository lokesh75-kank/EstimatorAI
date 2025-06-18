import React from 'react';
import { motion } from 'framer-motion';
import ParsedFieldInput from '../ParsedFieldInput';
import { ExtractedDoc } from '../../types';
import { BuildingDetailsCardProps } from '../types';

const BuildingDetailsCard: React.FC<BuildingDetailsCardProps> = ({
  data = {},
  onEdit,
  isConfirmed
}) => {
  const fields = [
    {
      key: 'project_type',
      label: 'Project Type',
      type: 'text',
      placeholder: 'Enter project type'
    },
    {
      key: 'square_footage',
      label: 'Square Footage',
      type: 'number',
      placeholder: 'Enter square footage'
    },
    {
      key: 'floors',
      label: 'Number of Floors',
      type: 'number',
      placeholder: 'Enter number of floors'
    }
  ];

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-gray-900">Building Details</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type}
              value={data?.[key] || ''}
              onChange={(e) => onEdit(key, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isConfirmed}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingDetailsCard; 