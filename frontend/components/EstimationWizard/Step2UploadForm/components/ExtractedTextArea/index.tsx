import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExtractedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  isConfirmed: boolean;
  label: string;
  tooltip?: string;
}

const ExtractedTextArea: React.FC<ExtractedTextAreaProps> = ({
  value,
  onChange,
  isConfirmed,
  label,
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{label}</span>
          {tooltip && (
            <span className="text-gray-400 cursor-help" title={tooltip}>ⓘ</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          {!isConfirmed && (
            <button
              onClick={() => {
                const text = value || '';
                navigator.clipboard.writeText(text);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy to clipboard"
            >
              📋
            </button>
          )}
        </div>
      </div>
      <div className={`transition-all duration-200 ${isExpanded ? 'max-h-[500px]' : 'max-h-[150px]'}`}>
        {isConfirmed ? (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap bg-gray-50">
            {value || 'No content'}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter or paste text here..."
            style={{ minHeight: '100px' }}
          />
        )}
      </div>
    </div>
  );
};

export default ExtractedTextArea; 