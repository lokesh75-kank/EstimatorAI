"use client";

import React, { useState, useEffect } from 'react';
import { DataSourceFormData, FieldMapping } from '@/types/dataSources';

interface Step3FieldMappingProps {
  formData: DataSourceFormData;
  onComplete: (stepData: Partial<DataSourceFormData>) => void;
  onBack: () => void;
}

export const Step3FieldMapping: React.FC<Step3FieldMappingProps> = ({
  formData,
  onComplete,
  onBack
}) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(formData.fieldMappings || []);
  const [vendorFields, setVendorFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Canonical fields that we need to map
  const canonicalFields = [
    { field: 'item_code', label: 'Item Code', required: true, dataType: 'string' as const },
    { field: 'description', label: 'Description', required: true, dataType: 'string' as const },
    { field: 'unit_price', label: 'Unit Price', required: true, dataType: 'number' as const },
    { field: 'available_qty', label: 'Available Quantity', required: false, dataType: 'number' as const },
    { field: 'category', label: 'Category', required: false, dataType: 'string' as const },
    { field: 'manufacturer', label: 'Manufacturer', required: false, dataType: 'string' as const },
    { field: 'model', label: 'Model', required: false, dataType: 'string' as const },
    { field: 'sku', label: 'SKU', required: false, dataType: 'string' as const }
  ];

  useEffect(() => {
    // Simulate discovering vendor fields from schema
    const discoverVendorFields = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock vendor fields based on source type
      const mockVendorFields = {
        sql: ['product_id', 'product_name', 'price', 'stock_qty', 'category_name', 'brand', 'model_number', 'sku_code'],
        rest: ['id', 'name', 'cost', 'inventory', 'type', 'maker', 'model', 'product_code'],
        file: ['item_id', 'item_desc', 'unit_cost', 'qty_available', 'item_category', 'manufacturer_name', 'model_name', 'stock_code']
      };
      
      setVendorFields(mockVendorFields[formData.type] || []);
      setIsLoading(false);
    };

    discoverVendorFields();
  }, [formData.type]);

  useEffect(() => {
    // Initialize field mappings if empty
    if (fieldMappings.length === 0 && vendorFields.length > 0) {
      const initialMappings = canonicalFields.map(canonical => ({
        canonicalField: canonical.field,
        vendorField: '',
        required: canonical.required,
        dataType: canonical.dataType
      }));
      setFieldMappings(initialMappings);
    }
  }, [vendorFields, fieldMappings.length]);

  const handleAutoMap = () => {
    const autoMappings = canonicalFields.map(canonical => {
      // Simple auto-mapping logic
      let vendorField = '';
      
      if (canonical.field === 'item_code') {
        vendorField = vendorFields.find(f => f.includes('id') || f.includes('code')) || '';
      } else if (canonical.field === 'description') {
        vendorField = vendorFields.find(f => f.includes('name') || f.includes('desc')) || '';
      } else if (canonical.field === 'unit_price') {
        vendorField = vendorFields.find(f => f.includes('price') || f.includes('cost')) || '';
      } else if (canonical.field === 'available_qty') {
        vendorField = vendorFields.find(f => f.includes('qty') || f.includes('stock') || f.includes('inventory')) || '';
      } else if (canonical.field === 'category') {
        vendorField = vendorFields.find(f => f.includes('category') || f.includes('type')) || '';
      } else if (canonical.field === 'manufacturer') {
        vendorField = vendorFields.find(f => f.includes('manufacturer') || f.includes('brand') || f.includes('maker')) || '';
      } else if (canonical.field === 'model') {
        vendorField = vendorFields.find(f => f.includes('model')) || '';
      } else if (canonical.field === 'sku') {
        vendorField = vendorFields.find(f => f.includes('sku')) || '';
      }

      return {
        canonicalField: canonical.field,
        vendorField,
        required: canonical.required,
        dataType: canonical.dataType
      };
    });

    setFieldMappings(autoMappings);
  };

  const handleMappingChange = (canonicalField: string, vendorField: string) => {
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.canonicalField === canonicalField 
          ? { ...mapping, vendorField }
          : mapping
      )
    );
  };

  const handleNext = () => {
    // Validate that all required fields are mapped
    const requiredMappings = fieldMappings.filter(mapping => mapping.required);
    const unmappedRequired = requiredMappings.filter(mapping => !mapping.vendorField);
    
    if (unmappedRequired.length > 0) {
      alert('Please map all required fields before continuing.');
      return;
    }

    onComplete({ fieldMappings });
  };

  const getUnmappedRequiredFields = () => {
    return fieldMappings.filter(mapping => mapping.required && !mapping.vendorField);
  };

  const unmappedRequired = getUnmappedRequiredFields();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Field Mapping</h3>
          <p className="text-sm text-gray-600">
            Discovering available fields from your data source...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Field Mapping</h3>
        <p className="text-sm text-gray-600">
          Map your vendor's fields to our canonical field structure for consistent data processing.
        </p>
      </div>

      {/* Auto-Map Button */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Available Vendor Fields</h4>
          <p className="text-sm text-gray-600">
            {vendorFields.length} fields detected
          </p>
        </div>
        <button
          onClick={handleAutoMap}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Auto-Map
        </button>
      </div>

      {/* Mapping Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm font-medium text-gray-900">Canonical Field</div>
            <div className="text-sm font-medium text-gray-900">Vendor Field</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {fieldMappings.map((mapping) => {
            const canonical = canonicalFields.find(c => c.field === mapping.canonicalField);
            const isUnmapped = mapping.required && !mapping.vendorField;
            
            return (
              <div 
                key={mapping.canonicalField}
                className={`px-6 py-4 ${isUnmapped ? 'bg-red-50' : ''}`}
              >
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {canonical?.label}
                      </span>
                      {mapping.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                      {canonical?.dataType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {canonical.dataType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {mapping.canonicalField}
                    </p>
                  </div>
                  
                  <div>
                    <select
                      value={mapping.vendorField}
                      onChange={(e) => handleMappingChange(mapping.canonicalField, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        isUnmapped ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select vendor field...</option>
                      {vendorFields.map((vendorField) => (
                        <option key={vendorField} value={vendorField}>
                          {vendorField}
                        </option>
                      ))}
                    </select>
                    {isUnmapped && (
                      <p className="text-xs text-red-600 mt-1">
                        This field is required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Summary */}
      {unmappedRequired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Required fields not mapped
              </h4>
              <p className="text-sm text-red-700 mt-1">
                Please map the following required fields: {unmappedRequired.map(m => canonicalFields.find(c => c.field === m.canonicalField)?.label).join(', ')}
              </p>
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
          onClick={handleNext}
          disabled={unmappedRequired.length > 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 