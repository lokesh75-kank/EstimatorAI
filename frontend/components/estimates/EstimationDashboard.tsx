import React, { useState, useEffect } from 'react';
import BOMTable, { BOMItem } from './BOMTable';
import CostBreakdown, { CostBreakdownData } from './CostBreakdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { estimationService, ProjectParams, EstimationResponse, EstimationError } from '@/services/estimationService';

interface EstimationDashboardProps {
  projectParams: ProjectParams;
  onEstimationComplete?: (estimation: EstimationResponse) => void;
  className?: string;
}

const EstimationDashboard: React.FC<EstimationDashboardProps> = ({
  projectParams,
  onEstimationComplete,
  className = ''
}) => {
  const [estimation, setEstimation] = useState<EstimationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EstimationError | null>(null);
  const [updating, setUpdating] = useState(false);

  // Generate estimation on component mount
  useEffect(() => {
    generateEstimation();
  }, []);

  const generateEstimation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await estimationService.generateEstimation({
        projectParams
      });
      
      setEstimation(result);
      onEstimationComplete?.(result);
    } catch (err: any) {
      setError(err);
      console.error('Failed to generate estimation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = async (itemCode: string, updates: Partial<BOMItem>) => {
    if (!estimation) return;
    
    setUpdating(true);
    try {
      // Create overrides object
      const overrides = {
        ...projectParams.overrides,
        [itemCode]: { quantity: updates.quantity || 0 }
      };

      const updatedEstimation = await estimationService.updateEstimation(
        estimation.estimateId,
        {
          projectParams: {
            ...projectParams,
            overrides
          }
        }
      );
      
      setEstimation(updatedEstimation);
    } catch (err: any) {
      setError(err);
      console.error('Failed to update estimation:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!estimation) return;
    
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'csv') {
        blob = await estimationService.exportToCSV(estimation.estimateId);
        filename = `estimation-${estimation.estimateId}.csv`;
      } else {
        blob = await estimationService.exportToPDF(estimation.estimateId);
        filename = `estimation-${estimation.estimateId}.pdf`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err);
      console.error(`Failed to export ${format}:`, err);
    }
  };

  const handleRegenerate = () => {
    generateEstimation();
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        text="Generating estimation..." 
        className={`min-h-64 ${className}`}
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Estimation Error"
        message={error.message}
        onRetry={handleRegenerate}
        className={className}
      />
    );
  }

  if (!estimation) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No estimation data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estimation Results</h2>
            <p className="text-gray-600 mt-1">
              Generated on {new Date(estimation.metadata.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRegenerate}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updating ? 'Updating...' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Project Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Project:</span>
            <span className="ml-2 font-medium">{projectParams.projectName}</span>
          </div>
          <div>
            <span className="text-gray-600">Building Type:</span>
            <span className="ml-2 font-medium">{projectParams.buildingType}</span>
          </div>
          <div>
            <span className="text-gray-600">Square Footage:</span>
            <span className="ml-2 font-medium">{projectParams.squareFootage.toLocaleString()} sq ft</span>
          </div>
          <div>
            <span className="text-gray-600">Floors:</span>
            <span className="ml-2 font-medium">{projectParams.numberOfFloors}</span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {estimation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {estimation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BOM Table - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <BOMTable
            bomItems={estimation.bomItems}
            costData={estimation.costBreakdown}
            onItemUpdate={handleItemUpdate}
            onExport={handleExport}
          />
        </div>

        {/* Cost Breakdown - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <CostBreakdown costData={estimation.costBreakdown} />
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="font-medium">Rule Version:</span> {estimation.metadata.ruleVersion}
          </div>
          <div>
            <span className="font-medium">Connector Version:</span> {estimation.metadata.connectorVersion}
          </div>
          <div>
            <span className="font-medium">Estimate ID:</span> {estimation.estimateId}
          </div>
          <div>
            <span className="font-medium">Project ID:</span> {estimation.projectId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimationDashboard; 