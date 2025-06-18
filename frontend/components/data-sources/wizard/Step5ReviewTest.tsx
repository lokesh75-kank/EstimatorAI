"use client";

import React, { useState, useEffect } from 'react';
import { DataSourceFormData } from '@/types/dataSources';

interface Step5ReviewTestProps {
  formData: DataSourceFormData;
  onComplete: (testResult: any) => void;
  onBack: () => void;
}

export const Step5ReviewTest: React.FC<Step5ReviewTestProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    // Generate mock preview data
    const generatePreviewData = () => {
      const mockData = [
        {
          item_code: 'FD-001',
          description: 'Smoke Detector - Ionization Type',
          unit_price: 45.99,
          available_qty: 150,
          category: 'Fire Detection',
          manufacturer: 'Acme Fire',
          model: 'SD-2000',
          sku: 'ACME-SD2000'
        },
        {
          item_code: 'FD-002',
          description: 'Heat Detector - Fixed Temperature',
          unit_price: 32.50,
          available_qty: 89,
          category: 'Fire Detection',
          manufacturer: 'Acme Fire',
          model: 'HD-1500',
          sku: 'ACME-HD1500'
        },
        {
          item_code: 'FA-001',
          description: 'Fire Alarm Panel - 4 Zone',
          unit_price: 1250.00,
          available_qty: 12,
          category: 'Fire Alarm',
          manufacturer: 'Acme Fire',
          model: 'FAP-4Z',
          sku: 'ACME-FAP4Z'
        },
        {
          item_code: 'CA-001',
          description: 'Cable - Fire Rated, 18 AWG',
          unit_price: 0.85,
          available_qty: 5000,
          category: 'Cables',
          manufacturer: 'WireCo',
          model: 'FR-18AWG',
          sku: 'WIRE-FR18'
        },
        {
          item_code: 'CA-002',
          description: 'Cable - Fire Rated, 16 AWG',
          unit_price: 1.25,
          available_qty: 3200,
          category: 'Cables',
          manufacturer: 'WireCo',
          model: 'FR-16AWG',
          sku: 'WIRE-FR16'
        }
      ];

      setPreviewData(mockData);

      // Generate warnings based on data anomalies
      const newWarnings = [];
      if (mockData.some(item => item.unit_price <= 0)) {
        newWarnings.push('Some items have zero or negative prices');
      }
      if (mockData.some(item => item.available_qty <= 0)) {
        newWarnings.push('Some items show zero or negative availability');
      }
      if (mockData.some(item => !item.description || item.description.length < 5)) {
        newWarnings.push('Some items have very short or missing descriptions');
      }
      if (mockData.some(item => item.unit_price > 10000)) {
        newWarnings.push('Some items have unusually high prices');
      }

      setWarnings(newWarnings);
    };

    generatePreviewData();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate comprehensive testing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const success = Math.random() > 0.2; // 80% success rate
      setTestResult({
        success,
        message: success 
          ? 'All tests passed! Your data source is ready to use.'
          : 'Some tests failed. Please review the configuration.',
        details: success ? {
          connection: '✓ Connected successfully',
          authentication: '✓ Authentication verified',
          schema: '✓ Schema detected and mapped',
          dataAccess: '✓ Data access confirmed',
          performance: '✓ Performance within limits'
        } : {
          connection: '✓ Connected successfully',
          authentication: '✗ Authentication failed',
          schema: '✓ Schema detected',
          dataAccess: '✗ Data access denied',
          performance: '✓ Performance within limits'
        }
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed due to an unexpected error.',
        details: {
          connection: '✗ Connection failed',
          authentication: '✗ Authentication failed',
          schema: '✗ Schema detection failed',
          dataAccess: '✗ Data access failed',
          performance: '✗ Performance test failed'
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleApprove = () => {
    onComplete({
      success: true,
      message: 'Data source approved and enabled successfully!'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sql':
        return '🗄️';
      case 'rest':
        return '🌐';
      case 'file':
        return '📁';
      default:
        return '📊';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Test Configuration</h3>
        <p className="text-sm text-gray-600">
          Review your configuration and test the connection before enabling the data source.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Configuration Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getTypeIcon(formData.type)}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">{formData.name}</div>
                <div className="text-xs text-gray-500 capitalize">{formData.type} Source</div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Type: {formData.type.toUpperCase()}</div>
              <div>• Sync: {formData.syncSettings?.syncType === 'batch' ? 'Batch' : 'Real-time'}</div>
              <div>• Cache TTL: {formData.syncSettings?.cacheTTL}s</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 mb-2">Field Mappings</div>
            <div className="space-y-1 text-xs text-gray-600">
              {formData.fieldMappings?.slice(0, 4).map((mapping, index) => (
                <div key={index}>
                  • {mapping.canonicalField} → {mapping.vendorField || 'Not mapped'}
                </div>
              ))}
              {formData.fieldMappings && formData.fieldMappings.length > 4 && (
                <div className="text-gray-500">... and {formData.fieldMappings.length - 4} more</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Connection */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Test Connection</h4>
            <p className="text-sm text-gray-600">
              Verify that your configuration works correctly
            </p>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Tests
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-md ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h5 className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </h5>
                {testResult.details && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(testResult.details).map(([key, value]) => (
                      <div key={key} className="text-xs flex items-center">
                        <span className={`mr-2 ${
                          String(value).startsWith('✓') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Data Preview</h4>
            <span className="text-xs text-gray-500">Showing 5 sample records</span>
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
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.item_code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {item.description}
                      {item.unit_price <= 0 && (
                        <svg className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.available_qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Data Quality Warnings
              </h4>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleApprove}
          disabled={!testResult?.success}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve & Enable
        </button>
      </div>
    </div>
  );
}; 