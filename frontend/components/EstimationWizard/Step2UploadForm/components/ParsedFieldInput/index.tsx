import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ParsedFieldInputProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  icon?: string;
  tooltip?: string;
}

const ParsedFieldInput: React.FC<ParsedFieldInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  tooltip
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm text-gray-500 mb-1 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
        {tooltip && (
          <span className="text-gray-400 cursor-help" title={tooltip}>ⓘ</span>
        )}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            ✏️
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParsedFieldInput; 