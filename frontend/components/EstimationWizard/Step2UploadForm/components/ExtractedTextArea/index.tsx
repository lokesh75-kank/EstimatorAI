import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExtractedTextAreaProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  isConfirmed: boolean;
  tooltip?: string;
}

const ExtractedTextArea: React.FC<ExtractedTextAreaProps> = ({
  label,
  value = '',
  onChange,
  isConfirmed,
  tooltip
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
        disabled={isConfirmed}
      />
    </div>
  );
};

export default ExtractedTextArea; 