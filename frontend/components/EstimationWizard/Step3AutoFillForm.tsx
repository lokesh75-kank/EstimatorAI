import React from 'react';
import ChatInterface from '@/components/Chat/ChatInterface';

interface Step3AutoFillFormProps {
  extractedDocs: any[];
  projectDetails: any;
  setProjectDetails: (val: any) => void;
  suggestions: string[];
  setSuggestions: (val: string[]) => void;
}

const Step3AutoFillForm: React.FC<Step3AutoFillFormProps> = ({ extractedDocs, projectDetails, setProjectDetails, suggestions, setSuggestions }) => {
  // For now, just show extracted fields and allow editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectDetails((prev: any) => ({ ...prev, [name]: value }));
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Auto-Fill</h2>
      <div className="space-y-4">
        {Object.entries(projectDetails).map(([key, value]) => (
          <div key={key}>
            <label className="form-label capitalize">{key}</label>
            <input type="text" name={key} value={String(value)} onChange={handleInputChange} className="input-field" />
          </div>
        ))}
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="font-semibold mb-2">Suggestions:</div>
          <ul className="list-disc ml-6">
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-6">
        <ChatInterface projectId={projectDetails.id || ''} />
      </div>
    </div>
  );
};

export default Step3AutoFillForm; 