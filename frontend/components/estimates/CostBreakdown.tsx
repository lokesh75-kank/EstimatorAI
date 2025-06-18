import React from 'react';

export interface CostBreakdownData {
  equipment: {
    subtotal: number;
    markup: number;
    total: number;
  };
  labor: {
    hours: number;
    rate: number;
    total: number;
  };
  permits: {
    fees: number;
    total: number;
  };
  taxes: {
    rate: number;
    amount: number;
  };
  contingency: {
    percentage: number;
    amount: number;
  };
  total: number;
}

interface CostBreakdownProps {
  costData: CostBreakdownData;
  className?: string;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({ costData, className = '' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Equipment Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Equipment</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(costData.equipment.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Markup:</span>
              <span className="font-medium">{formatCurrency(costData.equipment.markup)}</span>
            </div>
            <div className="flex justify-between col-span-2 border-t pt-2">
              <span className="font-medium text-gray-900">Equipment Total:</span>
              <span className="font-bold text-gray-900">{formatCurrency(costData.equipment.total)}</span>
            </div>
          </div>
        </div>

        {/* Labor Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Labor</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hours:</span>
              <span className="font-medium">{costData.labor.hours.toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">{formatCurrency(costData.labor.rate)}/hr</span>
            </div>
            <div className="flex justify-between col-span-2 border-t pt-2">
              <span className="font-medium text-gray-900">Labor Total:</span>
              <span className="font-bold text-gray-900">{formatCurrency(costData.labor.total)}</span>
            </div>
          </div>
        </div>

        {/* Permits Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Permits & Fees</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Permit Fees:</span>
            <span className="font-medium">{formatCurrency(costData.permits.fees)}</span>
          </div>
        </div>

        {/* Taxes Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Taxes</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Rate:</span>
              <span className="font-medium">{formatPercentage(costData.taxes.rate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="font-medium">{formatCurrency(costData.taxes.amount)}</span>
            </div>
          </div>
        </div>

        {/* Contingency Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Contingency</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium">{formatPercentage(costData.contingency.percentage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(costData.contingency.amount)}</span>
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Estimate</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(costData.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown; 