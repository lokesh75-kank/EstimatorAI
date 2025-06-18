import React from 'react';

interface ParsedFieldInputProps {
  label: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  isConfirmed: boolean;
  tooltip?: string;
}

const ParsedFieldInput: React.FC<ParsedFieldInputProps> = ({
  label,
  value = '',
  onChange,
  type = 'text',
  placeholder,
  isConfirmed,
  tooltip
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {tooltip && (
          <span className="text-xs text-gray-500">{tooltip}</span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        disabled={isConfirmed}
      />
    </div>
  );
};

export default ParsedFieldInput; 