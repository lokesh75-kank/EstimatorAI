import React from 'react';

interface Step4BOMTableProps {
  bomData: any[];
  setBOMData: (val: any[]) => void;
  warnings: string[];
  setWarnings: (val: string[]) => void;
}

const Step4BOMTable: React.FC<Step4BOMTableProps> = ({ bomData, setBOMData, warnings, setWarnings }) => {
  // Placeholder table
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">BOM/Compliance Review</h2>
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr>
            <th>Device</th>
            <th>Qty</th>
            <th>Unit Cost</th>
            <th>Labor</th>
            <th>Total</th>
            <th>Margin</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {bomData && bomData.length > 0 ? bomData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.device}</td>
              <td>{row.qty}</td>
              <td>{row.unitCost}</td>
              <td>{row.labor}</td>
              <td>{row.total}</td>
              <td>{row.margin}</td>
              <td><button className="text-blue-600">Edit</button></td>
            </tr>
          )) : <tr><td colSpan={7} className="text-center text-gray-400">No BOM data</td></tr>}
        </tbody>
      </table>
      {warnings && warnings.length > 0 && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="font-semibold mb-2">Warnings:</div>
          <ul className="list-disc ml-6">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <button className="btn-secondary">Show Heatmap Overlay</button>
      </div>
    </div>
  );
};

export default Step4BOMTable; 