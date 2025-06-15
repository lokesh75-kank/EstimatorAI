import React from 'react';

interface Step5ProposalPreviewProps {
  proposalData: any;
  setProposalData: (val: any) => void;
}

const Step5ProposalPreview: React.FC<Step5ProposalPreviewProps> = ({ proposalData, setProposalData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Proposal</h2>
      <div className="bg-gray-100 rounded p-4">
        <div className="mb-4">[PDF Preview Placeholder]</div>
        <div className="flex space-x-4">
          <button className="btn-secondary">Edit Terms</button>
          <button className="btn-primary">Export PDF</button>
          <button className="btn-primary">Send Proposal</button>
        </div>
      </div>
    </div>
  );
};

export default Step5ProposalPreview; 