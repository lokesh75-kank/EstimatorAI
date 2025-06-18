import React, { useState } from 'react';
import { CostBreakdownData } from './CostBreakdown';

export interface BOMItem {
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  labor_hours?: number;
  source: string;
}

interface BOMTableProps {
  bomItems: BOMItem[];
  costData: CostBreakdownData;
  onItemUpdate?: (itemCode: string, updates: Partial<BOMItem>) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  className?: string;
}

const BOMTable: React.FC<BOMTableProps> = ({ 
  bomItems, 
  costData, 
  onItemUpdate, 
  onExport,
  className = '' 
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BOMItem>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleEdit = (item: BOMItem) => {
    setEditingItem(item.item_code);
    setEditValues({ quantity: item.quantity });
  };

  const handleSave = (itemCode: string) => {
    if (onItemUpdate && editValues.quantity !== undefined) {
      onItemUpdate(itemCode, editValues);
    }
    setEditingItem(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const handleExportCSV = () => {
    if (!onExport) return;
    
    const csvContent = [
      ['Item Code', 'Description', 'Quantity', 'Unit Price', 'Total Price', 'Labor Hours', 'Source'],
      ...bomItems.map(item => [
        item.item_code,
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unit_price),
        formatCurrency(item.quantity * item.unit_price),
        item.labor_hours?.toString() || '0',
        item.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bom-estimate.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (onExport) {
      onExport('pdf');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bill of Materials</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Labor Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bomItems.length > 0 ? (
              bomItems.map((item) => (
                <tr key={item.item_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.item_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingItem === item.item_code ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.quantity || item.quantity}
                        onChange={(e) => setEditValues({ quantity: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.labor_hours?.toFixed(1) || '0.0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.source === 'user_override' ? 'bg-blue-100 text-blue-800' :
                      item.source === 'per_sqft_rule' ? 'bg-green-100 text-green-800' :
                      item.source === 'per_floor_rule' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingItem === item.item_code ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSave(item.item_code)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No BOM items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-medium">{bomItems.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Equipment Total:</span>
            <span className="ml-2 font-medium">{formatCurrency(costData.equipment.total)}</span>
          </div>
          <div>
            <span className="text-gray-600">Labor Total:</span>
            <span className="ml-2 font-medium">{formatCurrency(costData.labor.total)}</span>
          </div>
          <div>
            <span className="text-gray-600">Grand Total:</span>
            <span className="ml-2 font-bold text-lg">{formatCurrency(costData.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMTable; 