import React, { useState } from 'react';
import { DataSource, ConnectionStatus } from '@/types/dataSources';

interface ConnectorDetailViewProps {
  dataSource: DataSource;
  onClose: () => void;
  onUpdate: (dataSource: DataSource) => void;
}

interface SyncHistory {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'partial';
  recordsProcessed: number;
  errors?: string[];
  duration: number; // in seconds
}

export const ConnectorDetailView: React.FC<ConnectorDetailViewProps> = ({
  dataSource,
  onClose,
  onUpdate
}) => {
  const [isResyncing, setIsResyncing] = useState(false);
  const [showErrorLogs, setShowErrorLogs] = useState(false);

  // Mock sync history
  const syncHistory: SyncHistory[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      status: 'success',
      recordsProcessed: 1250,
      duration: 45
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      status: 'error',
      recordsProcessed: 0,
      errors: ['Connection timeout', 'Authentication failed'],
      duration: 12
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000),
      status: 'partial',
      recordsProcessed: 800,
      errors: ['Some records failed to sync'],
      duration: 38
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 14400000),
      status: 'success',
      recordsProcessed: 1200,
      duration: 42
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 18000000),
      status: 'success',
      recordsProcessed: 1180,
      duration: 40
    }
  ];

  const handleForceResync = async () => {
    setIsResyncing(true);
    try {
      // Simulate force re-sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update status to connected
      onUpdate({
        ...dataSource,
        status: 'connected' as ConnectionStatus,
        lastSynced: new Date().toISOString()
      });
    } finally {
      setIsResyncing(false);
    }
  };

  const getStatusIcon = (status: SyncHistory['status']) => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'partial':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{dataSource.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {dataSource.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleForceResync}
              disabled={isResyncing}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isResyncing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Re-syncing...
                </>
              ) : (
                'Force Re-sync'
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connection Details */}
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Type</span>
                  <p className="text-sm text-gray-900 mt-1">{dataSource.type.toUpperCase()}</p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{dataSource.status.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Last Sync</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {dataSource.lastSynced ? formatTimestamp(new Date(dataSource.lastSynced)) : 'Never'}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Cache TTL</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {Math.floor(dataSource.cacheTTL / 60)} minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Field Mappings */}
            {dataSource.fieldMappings && dataSource.fieldMappings.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Field Mappings</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Canonical Field
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor Field
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataSource.fieldMappings.map((mapping, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {mapping.canonicalField}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {mapping.vendorField}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {mapping.required ? 'Required' : 'Optional'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sync History</h3>
              
              <div className="space-y-3">
                {syncHistory.map((sync) => (
                  <div key={sync.id} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(sync.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sync.recordsProcessed} records
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(sync.timestamp)} • {formatDuration(sync.duration)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sync.status === 'success' ? 'bg-green-100 text-green-800' :
                        sync.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sync.status}
                      </span>
                    </div>
                    
                    {sync.errors && sync.errors.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => setShowErrorLogs(!showErrorLogs)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          {showErrorLogs ? 'Hide' : 'Show'} errors ({sync.errors.length})
                        </button>
                        
                        {showErrorLogs && (
                          <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
                            {sync.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 