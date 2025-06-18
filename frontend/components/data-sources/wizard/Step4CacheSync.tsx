"use client";

import React, { useState } from 'react';
import { DataSourceFormData, SyncSettings } from '@/types/dataSources';

interface Step4CacheSyncProps {
  formData: DataSourceFormData;
  onComplete: (stepData: Partial<DataSourceFormData>) => void;
  onBack: () => void;
}

export const Step4CacheSync: React.FC<Step4CacheSyncProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(
    formData.syncSettings || {
      syncType: 'batch',
      cacheTTL: 3600,
      enabled: true
    }
  );

  const batchScheduleOptions = [
    { value: '0 2 * * *', label: 'Daily at 2 AM', description: 'Sync once per day at 2:00 AM' },
    { value: '0 */6 * * *', label: 'Every 6 hours', description: 'Sync 4 times per day' },
    { value: '0 */4 * * *', label: 'Every 4 hours', description: 'Sync 6 times per day' },
    { value: '0 */2 * * *', label: 'Every 2 hours', description: 'Sync 12 times per day' },
    { value: '0 * * * *', label: 'Hourly', description: 'Sync every hour' },
    { value: '0 */12 * * *', label: 'Every 12 hours', description: 'Sync twice per day' },
    { value: 'custom', label: 'Custom schedule', description: 'Define your own cron expression' }
  ];

  const cacheTTLOptions = [
    { value: 900, label: '15 minutes', description: 'Very fresh data, high API usage' },
    { value: 1800, label: '30 minutes', description: 'Fresh data, moderate API usage' },
    { value: 3600, label: '1 hour', description: 'Balanced freshness and performance' },
    { value: 7200, label: '2 hours', description: 'Good performance, slightly older data' },
    { value: 14400, label: '4 hours', description: 'Better performance, older data' },
    { value: 28800, label: '8 hours', description: 'High performance, older data' },
    { value: 86400, label: '24 hours', description: 'Maximum performance, daily data' }
  ];

  const handleSyncTypeChange = (syncType: 'batch' | 'realtime') => {
    setSyncSettings(prev => ({
      ...prev,
      syncType
    }));
  };

  const handleBatchScheduleChange = (schedule: string) => {
    setSyncSettings(prev => ({
      ...prev,
      batchSchedule: schedule === 'custom' ? prev.batchSchedule : schedule
    }));
  };

  const handleCustomScheduleChange = (schedule: string) => {
    setSyncSettings(prev => ({
      ...prev,
      batchSchedule: schedule
    }));
  };

  const handleCacheTTLChange = (ttl: number) => {
    setSyncSettings(prev => ({
      ...prev,
      cacheTTL: ttl
    }));
  };

  const handleEnabledChange = (enabled: boolean) => {
    setSyncSettings(prev => ({
      ...prev,
      enabled
    }));
  };

  const handleNext = () => {
    onComplete({ syncSettings });
  };

  const isNextEnabled = () => {
    return syncSettings.enabled && (
      syncSettings.syncType === 'realtime' || 
      (syncSettings.syncType === 'batch' && syncSettings.batchSchedule)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sync & Cache Settings</h3>
        <p className="text-sm text-gray-600">
          Configure how and when your data source should sync and cache data.
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Enable Data Source</h4>
          <p className="text-sm text-gray-600">
            Enable this data source for use in estimations
          </p>
        </div>
        <button
          onClick={() => handleEnabledChange(!syncSettings.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            syncSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              syncSettings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {syncSettings.enabled && (
        <>
          {/* Sync Type Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Type</h4>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="syncType"
                  value="batch"
                  checked={syncSettings.syncType === 'batch'}
                  onChange={() => handleSyncTypeChange('batch')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Batch Sync</div>
                  <div className="text-sm text-gray-600">
                    Sync data on a schedule. Best for large datasets and cost optimization.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="syncType"
                  value="realtime"
                  checked={syncSettings.syncType === 'realtime'}
                  onChange={() => handleSyncTypeChange('realtime')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Real-time Sync</div>
                  <div className="text-sm text-gray-600">
                    Sync data in real-time. Best for live pricing and availability.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Batch Schedule (only show if batch sync is selected) */}
          {syncSettings.syncType === 'batch' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Batch Schedule</h4>
              <div className="space-y-2">
                {batchScheduleOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="batchSchedule"
                      value={option.value}
                      checked={syncSettings.batchSchedule === option.value}
                      onChange={() => handleBatchScheduleChange(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Schedule Input */}
              {syncSettings.batchSchedule === 'custom' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <label htmlFor="customSchedule" className="block text-sm font-medium text-blue-900 mb-2">
                    Custom Cron Expression
                  </label>
                  <input
                    type="text"
                    id="customSchedule"
                    value={syncSettings.batchSchedule === 'custom' ? '' : syncSettings.batchSchedule || ''}
                    onChange={(e) => handleCustomScheduleChange(e.target.value)}
                    placeholder="0 2 * * * (minute hour day month weekday)"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    Format: minute hour day month weekday (e.g., "0 2 * * *" for daily at 2 AM)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cache TTL */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Cache Time-to-Live (TTL)</h4>
            <p className="text-sm text-gray-600 mb-3">
              How long to cache data before refreshing. Shorter TTL = fresher data but more API calls.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cacheTTLOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="cacheTTL"
                    value={option.value}
                    checked={syncSettings.cacheTTL === option.value}
                    onChange={() => handleCacheTTLChange(option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Sync Type: <span className="font-medium">{syncSettings.syncType === 'batch' ? 'Batch' : 'Real-time'}</span></div>
              {syncSettings.syncType === 'batch' && syncSettings.batchSchedule && (
                <div>• Schedule: <span className="font-medium">
                  {batchScheduleOptions.find(opt => opt.value === syncSettings.batchSchedule)?.label || 'Custom'}
                </span></div>
              )}
              <div>• Cache TTL: <span className="font-medium">
                {cacheTTLOptions.find(opt => opt.value === syncSettings.cacheTTL)?.label || `${syncSettings.cacheTTL} seconds`}
              </span></div>
            </div>
          </div>
        </>
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
          onClick={handleNext}
          disabled={!isNextEnabled()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 