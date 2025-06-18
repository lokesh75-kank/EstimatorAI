"use client";

import React, { useState } from 'react';
import { DataSourceFormData, ConnectionDetails } from '@/types/dataSources';

interface Step2ConnectionDetailsProps {
  formData: DataSourceFormData;
  onComplete: (stepData: Partial<DataSourceFormData>) => void;
  onBack: () => void;
}

export const Step2ConnectionDetails: React.FC<Step2ConnectionDetailsProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails>(
    formData.connectionDetails || {}
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFieldChange = (field: keyof ConnectionDetails, value: any) => {
    setConnectionDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success 
          ? 'Connection successful! Database schema detected.'
          : 'Connection failed. Please check your credentials and try again.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed. Please check your settings.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleNext = () => {
    if (testResult?.success) {
      onComplete({ connectionDetails });
    }
  };

  const renderSQLFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
            Host
          </label>
          <input
            type="text"
            id="host"
            value={connectionDetails.host || ''}
            onChange={(e) => handleFieldChange('host', e.target.value)}
            placeholder="localhost"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            type="number"
            id="port"
            value={connectionDetails.port || ''}
            onChange={(e) => handleFieldChange('port', parseInt(e.target.value))}
            placeholder="3306"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">
          Database Name
        </label>
        <input
          type="text"
          id="database"
          value={connectionDetails.database || ''}
          onChange={(e) => handleFieldChange('database', e.target.value)}
          placeholder="inventory_db"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={connectionDetails.username || ''}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            placeholder="db_user"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={connectionDetails.password || ''}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ssl"
          checked={connectionDetails.ssl || false}
          onChange={(e) => handleFieldChange('ssl', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="ssl" className="ml-2 block text-sm text-gray-700">
          Use SSL connection
        </label>
      </div>
    </div>
  );

  const renderRESTFields = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Base URL
        </label>
        <input
          type="url"
          id="baseUrl"
          value={connectionDetails.baseUrl || ''}
          onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
          placeholder="https://api.vendor.com/v1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Authentication Type
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="authType"
              value="api_key"
              checked={connectionDetails.authType === 'api_key'}
              onChange={(e) => handleFieldChange('authType', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">API Key</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="authType"
              value="oauth2"
              checked={connectionDetails.authType === 'oauth2'}
              onChange={(e) => handleFieldChange('authType', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">OAuth 2.0</span>
          </label>
        </div>
      </div>
      
      {connectionDetails.authType === 'api_key' && (
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={connectionDetails.apiKey || ''}
            onChange={(e) => handleFieldChange('apiKey', e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      {connectionDetails.authType === 'oauth2' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              value={connectionDetails.clientId || ''}
              onChange={(e) => handleFieldChange('clientId', e.target.value)}
              placeholder="your_client_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              id="clientSecret"
              value={connectionDetails.clientSecret || ''}
              onChange={(e) => handleFieldChange('clientSecret', e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderFileFields = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
          File URL or S3 Path
        </label>
        <input
          type="text"
          id="fileUrl"
          value={connectionDetails.fileUrl || ''}
          onChange={(e) => handleFieldChange('fileUrl', e.target.value)}
          placeholder="https://example.com/data.csv or s3://bucket/path/file.csv"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Supports CSV, Excel, and JSON files from HTTP URLs or S3 paths
        </p>
      </div>
      
      {connectionDetails.fileUrl?.startsWith('s3://') && (
        <div>
          <label htmlFor="iamRole" className="block text-sm font-medium text-gray-700 mb-1">
            IAM Role (Optional)
          </label>
          <input
            type="text"
            id="iamRole"
            value={connectionDetails.iamRole || ''}
            onChange={(e) => handleFieldChange('iamRole', e.target.value)}
            placeholder="arn:aws:iam::123456789012:role/DataAccessRole"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            IAM role for accessing S3. Leave empty to use default credentials.
          </p>
        </div>
      )}
    </div>
  );

  const renderFields = () => {
    switch (formData.type) {
      case 'sql':
        return renderSQLFields();
      case 'rest':
        return renderRESTFields();
      case 'file':
        return renderFileFields();
      default:
        return null;
    }
  };

  const isTestEnabled = () => {
    switch (formData.type) {
      case 'sql':
        return connectionDetails.host && connectionDetails.database && connectionDetails.username;
      case 'rest':
        return connectionDetails.baseUrl;
      case 'file':
        return connectionDetails.fileUrl;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Details</h3>
        <p className="text-sm text-gray-600">
          Configure the connection parameters for your {formData.type.toUpperCase()} data source.
        </p>
      </div>

      {renderFields()}

      {/* Test Connection */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={handleTestConnection}
          disabled={!isTestEnabled() || isTesting}
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
              Test Connection
            </>
          )}
        </button>

        {testResult && (
          <div className={`mt-3 p-3 rounded-md ${
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
                <p className={`text-sm ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!testResult?.success}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 