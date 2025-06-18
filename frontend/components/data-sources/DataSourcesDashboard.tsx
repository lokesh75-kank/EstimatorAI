"use client";

import React, { useState, useEffect } from 'react';
import { DataSourceCard } from './DataSourceCard';
import { AddSourceButton } from './AddSourceButton';
import { AddSourceWizard } from './AddSourceWizard';
import { ConnectorDetailView } from './ConnectorDetailView';
import { DataSource, DataSourceType, ConnectionStatus, DataSourceFormData } from '@/types/dataSources';

interface DataSourcesDashboardProps {
  className?: string;
}

const DataSourcesDashboard: React.FC<DataSourcesDashboardProps> = ({ className = '' }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<DataSourceType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading data sources
    setTimeout(() => {
      setDataSources([]); // Start with empty state
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddSource = () => {
    setIsWizardOpen(true);
  };

  const handleSourceAdded = (formData: DataSourceFormData) => {
    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      status: 'active',
      lastSynced: null,
      recordCount: null,
      cacheTTL: formData.syncSettings.cacheTTL,
      description: formData.description || '',
      connectionDetails: formData.connectionDetails,
      fieldMappings: formData.fieldMappings,
      syncSettings: formData.syncSettings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDataSources(prev => [newSource, ...prev]);
    setIsWizardOpen(false);
    // Show toast notification
    showToast(`Vendor Source '${newSource.name}' added and syncing`);
  };

  const handleCardClick = (source: DataSource) => {
    setSelectedSource(source);
    setIsDetailViewOpen(true);
  };

  const handleEditSource = (source: DataSource) => {
    setSelectedSource(source);
    setIsWizardOpen(true);
  };

  const handleResyncSource = async (sourceId: string) => {
    // Simulate resync
    setDataSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, status: 'syncing', lastSynced: 'Just now' }
          : source
      )
    );
    
    // Simulate sync completion
    setTimeout(() => {
      setDataSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { ...source, status: 'active', lastSynced: '2m ago' }
            : source
        )
      );
    }, 3000);
  };

  const handleToggleSource = (sourceId: string, enabled: boolean) => {
    setDataSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, status: enabled ? 'active' : 'disabled' }
          : source
      )
    );
  };

  const showToast = (message: string) => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const filteredDataSources = dataSources.filter(source => {
    const matchesType = filterType === 'all' || source.type === filterType;
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleTestAll = async () => {
    setLoading(true);
    // Simulate testing all connections
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const handleDeleteSource = (id: string) => {
    setDataSources(prev => prev.filter(source => source.id !== id));
  };

  const handleStatusUpdate = (id: string, status: ConnectionStatus) => {
    setDataSources(prev => prev.map(source => 
      source.id === id ? { ...source, status } : source
    ));
  };

  const handleUpdateSource = (updatedSource: DataSource) => {
    setDataSources((prev) => prev.map(ds => ds.id === updatedSource.id ? updatedSource : ds));
    setSelectedSource(updatedSource);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Data Sources</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connect vendor data sources for live pricing and availability
          </p>
        </div>
        <AddSourceButton onClick={handleAddSource} />
      </div>

      {/* Global Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter by Type */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DataSourceType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sql">SQL Database</option>
              <option value="nosql">NoSQL Database</option>
              <option value="rest">REST API</option>
              <option value="file">File Upload</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Sources
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-end">
            <button
              onClick={handleTestAll}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Testing...' : 'Test All'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSources.length === 0 ? (
          /* Empty State */
          <div className="col-span-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
              <div className="text-6xl mb-4">➕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Add Your First Vendor Source
              </h3>
              <p className="text-gray-600 mb-6">
                Live pricing, availability & metadata for Smart BOM
              </p>
              <button
                onClick={handleAddSource}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Configure Data Source
              </button>
            </div>
          </div>
        ) : (
          /* Populated State */
          filteredDataSources.map((source) => (
            <DataSourceCard
              key={source.id}
              source={source}
              onClick={() => handleCardClick(source)}
              onEdit={() => handleEditSource(source)}
              onResync={() => handleResyncSource(source.id)}
              onToggle={(enabled) => handleToggleSource(source.id, enabled)}
            />
          ))
        )}
      </div>

      {/* Add Source Wizard */}
      {isWizardOpen && (
        <AddSourceWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleSourceAdded}
        />
      )}

      {/* Detail View Modal */}
      {selectedSource && (
        <ConnectorDetailView
          dataSource={selectedSource}
          onClose={() => setSelectedSource(null)}
          onUpdate={handleUpdateSource}
        />
      )}

      {/* Blocking Prompt for New Estimation */}
      {dataSources.length === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Vendor Data Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To generate Smart BOMs, please configure at least one Vendor Data Source.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddSource}
                  className="bg-yellow-400 px-4 py-2 text-sm font-medium text-yellow-900 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Configure Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Sources:</span>
            <span className="ml-2 font-medium">{dataSources.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Connected:</span>
            <span className="ml-2 font-medium text-green-600">
              {dataSources.filter(s => s.status === 'active').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <span className="ml-2 font-medium text-red-600">
              {dataSources.filter(s => s.status === 'error').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Not Configured:</span>
            <span className="ml-2 font-medium text-gray-600">
              {dataSources.filter(s => s.status === 'disabled').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesDashboard; 