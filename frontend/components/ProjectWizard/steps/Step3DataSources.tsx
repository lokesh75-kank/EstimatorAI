import React, { useState, useEffect } from 'react';
import { ProjectFormData } from '../types';

interface Step3DataSourcesProps {
  projectData: ProjectFormData | null;
  updateSession: (data: Partial<ProjectFormData>, step?: number) => Promise<void>;
  loading: boolean;
}

interface AIAnalysisItem {
  code: string;
  description: string;
  qty: number;
  specSummary: string;
  unitPrice: number;
  vendor: string;
  source: string;
  category: string;
  placement?: string;
  compliance?: string;
  confidence?: number;
  rationale?: string;
  totalPrice: number;
}

const Step3DataSources: React.FC<Step3DataSourcesProps> = ({ 
  projectData, 
  updateSession, 
  loading: sessionLoading 
}) => {
  const [aiSourcingEnabled, setAiSourcingEnabled] = React.useState(true);
  const [aiState, setAiState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiSamples, setAiSamples] = React.useState<AIAnalysisItem[]>([]);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [stepCompleted, setStepCompleted] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<Partial<AIAnalysisItem>>({});
  const [selectedTab, setSelectedTab] = useState<'overview' | 'items' | 'vendors' | 'analysis'>('overview');
  const [showRationale, setShowRationale] = useState<string | null>(null);

  // Load AI analysis from session data
  useEffect(() => {
    if (projectData?.aiAnalysis && projectData.aiAnalysis.estimationElements) {
      console.log('DataSourcesStep: Loading AI analysis from session:', projectData.aiAnalysis);
      const elements = generateEstimationElements(projectData.aiAnalysis);
      setAiSamples(elements);
      setAiState('success');
      setStepCompleted(true);
    } else {
      console.log('DataSourcesStep: No AI analysis found in session');
      setAiState('idle');
      setAiSamples([]);
    }
  }, [projectData?.aiAnalysis]);

  // Generate estimation elements from AI analysis data
  const generateEstimationElements = (aiAnalysis: any): AIAnalysisItem[] => {
    const elements: AIAnalysisItem[] = [];
    
    // Extract estimation elements from AI analysis
    if (aiAnalysis.estimationElements && Array.isArray(aiAnalysis.estimationElements)) {
      aiAnalysis.estimationElements.forEach((element: any) => {
        const qty = element.quantity || element.qty || estimateQuantity(element.category, projectData);
        const unitPrice = element.unit_price || element.unitPrice || 0;
        
        elements.push({
          code: element.code || generateItemCode(element.category || 'GEN', elements.length),
          description: element.name || element.description,
          qty,
          specSummary: element.specifications || element.specSummary || '',
          unitPrice,
          vendor: element.vendor || getRecommendedVendor(element.category, aiAnalysis.vendors),
          source: 'AI Analysis',
          category: element.category || 'General',
          placement: element.placement,
          compliance: element.compliance,
          confidence: element.confidence || 0.85,
          rationale: element.rationale || generateRationale(element, projectData),
          totalPrice: qty * unitPrice
        });
      });
    }
    
    // Fallback to materials if estimation elements not found
    if (aiAnalysis.materials && Array.isArray(aiAnalysis.materials)) {
      aiAnalysis.materials.forEach((material: any, index: number) => {
        const qty = estimateQuantity(material.category, projectData);
        const unitPrice = parsePrice(material.estimatedCost);
        
        elements.push({
          code: generateItemCode(material.category || 'GEN', index),
          description: material.name,
          qty,
          specSummary: material.specifications || '',
          unitPrice,
          vendor: getRecommendedVendor(material.category, aiAnalysis.vendors),
          source: 'AI Analysis',
          category: material.category || 'General',
          confidence: 0.8,
          rationale: generateRationale(material, projectData),
          totalPrice: qty * unitPrice
        });
      });
    }

    return elements;
  };

  const generateRationale = (element: any, projectData: ProjectFormData | null): string => {
    if (!projectData) return 'Based on standard industry requirements';
    
    const buildingType = projectData.buildingType;
    const squareFootage = projectData.squareFootage;
    const floors = projectData.numberOfFloors;
    
    const rationales: { [key: string]: string } = {
      'smoke_detector': `Required for ${buildingType} building (${squareFootage} sq ft). NFPA 72 requires 1 detector per 900 sq ft for commercial spaces.`,
      'control_panel': `Fire alarm control panel needed for ${floors} floor building. NFPA 72 requires dedicated control panel for fire alarm systems.`,
      'pull_station': `Manual pull stations required per NFPA 72. Building size suggests ${Math.ceil(squareFootage / 2000)} stations for proper coverage.`,
      'heat_detector': `Heat detectors recommended for areas where smoke detectors may cause false alarms. ${Math.ceil(squareFootage / 1200)} units for comprehensive coverage.`,
      'cable': `Fire-rated cable required for all fire alarm circuits. Estimated ${Math.ceil(squareFootage / 100)} feet based on building layout.`,
      'conduit': `Conduit for cable protection and routing. Estimated ${Math.ceil(squareFootage / 200)} feet for proper installation.`
    };
    
    return rationales[element.category] || `Standard requirement for ${buildingType} building based on ${squareFootage} sq ft area.`;
  };

  // Helper functions
  const generateItemCode = (category: string, index: number): string => {
    const prefixes: { [key: string]: string } = {
      'smoke_detector': 'SD',
      'control_panel': 'FS',
      'backbox': 'BX',
      'pull_station': 'WP',
      'heat_detector': 'HR',
      'cable': 'CB',
      'conduit': 'CD'
    };
    const prefix = prefixes[category] || 'IT';
    return `${prefix}-${String(index + 1).padStart(4, '0')}`;
  };

  const estimateQuantity = (category: string, projectData: ProjectFormData | null): number => {
    if (!projectData) return 1;
    
    const squareFootage = projectData.squareFootage || 1000;
    const floors = projectData.numberOfFloors || 1;
    
    const estimates: { [key: string]: number } = {
      'smoke_detector': Math.ceil(squareFootage / 900), // 1 per 900 sq ft
      'control_panel': Math.max(1, Math.ceil(floors / 3)), // 1 per 3 floors
      'backbox': Math.ceil(squareFootage / 500), // 1 per 500 sq ft
      'pull_station': Math.ceil(squareFootage / 2000), // 1 per 2000 sq ft
      'heat_detector': Math.ceil(squareFootage / 1200), // 1 per 1200 sq ft
      'cable': Math.ceil(squareFootage / 100), // feet per sq ft
      'conduit': Math.ceil(squareFootage / 200) // feet per sq ft
    };
    
    return estimates[category] || 1;
  };

  const parsePrice = (priceString: string): number => {
    if (!priceString) return 0;
    const match = priceString.match(/\$?(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getRecommendedVendor = (category: string, vendors: any[]): string => {
    if (!vendors || vendors.length === 0) {
      return category.includes('detector') || category.includes('panel') ? 'Graybar' : 'Anixter';
    }
    
    // Find vendor with highest confidence for this category
    const bestVendor = vendors.reduce((best, vendor) => {
      return vendor.confidence > best.confidence ? vendor : best;
    });
    
    return bestVendor.name || 'Graybar';
  };

  // Handle item editing
  const handleEdit = (item: AIAnalysisItem) => {
    setEditingItem(item.code);
    setEditValues({ qty: item.qty, unitPrice: item.unitPrice });
  };

  const handleSave = (itemCode: string) => {
    setAiSamples(prev => prev.map(item => 
      item.code === itemCode 
        ? { ...item, ...editValues, totalPrice: (editValues.qty || item.qty) * (editValues.unitPrice || item.unitPrice) }
        : item
    ));
    setEditingItem(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValues({});
  };

  // Calculate totals
  const totalItems = aiSamples.length;
  const totalValue = aiSamples.reduce((sum, item) => sum + item.totalPrice, 0);
  const averageConfidence = aiSamples.length > 0 
    ? aiSamples.reduce((sum, item) => sum + (item.confidence || 0), 0) / aiSamples.length 
    : 0;

  // Get unique vendors
  const uniqueVendors = Array.from(new Set(aiSamples.map(item => item.vendor)));

  // Get category breakdown
  const categoryBreakdown = aiSamples.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI Analysis Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 card-hover animate-fade-in-slide-down">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📊</div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-blue-900">Total Items</p>
            <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 card-hover animate-fade-in-slide-down" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-green-900">Total Value</p>
            <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 card-hover animate-fade-in-slide-down" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center">
            <div className="text-2xl mr-3">🏢</div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-purple-900">Vendors</p>
            <p className="text-2xl font-bold text-purple-600">{uniqueVendors.length}</p>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 card-hover animate-fade-in-slide-down" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center">
            <div className="text-2xl mr-3">🎯</div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-orange-900">Confidence</p>
            <p className="text-2xl font-bold text-orange-600">{(averageConfidence * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryBreakdown).map(([category, count]) => (
            <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-blue-600">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Vendors</h3>
        <div className="space-y-3">
          {uniqueVendors.map((vendor, index) => (
            <div key={vendor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                  {index + 1}
                </div>
                <span className="ml-3 font-medium text-gray-900">{vendor}</span>
              </div>
              <span className="text-sm text-gray-500">
                {aiSamples.filter(item => item.vendor === vendor).length} items
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderItemsTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI-Sourced Estimation Elements</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          {aiSamples.length} items found
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aiSamples.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-gray-500">{item.specSummary}</div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {editingItem === item.code ? (
                    <input
                      type="number"
                      value={editValues.qty || item.qty}
                      onChange={(e) => setEditValues({ ...editValues, qty: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    item.qty
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {editingItem === item.code ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValues.unitPrice || item.unitPrice}
                      onChange={(e) => setEditValues({ ...editValues, unitPrice: parseFloat(e.target.value) })}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    `$${item.unitPrice.toFixed(2)}`
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.vendor}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(item.confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{(item.confidence || 0) * 100}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {editingItem === item.code ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave(item.code)}
                        className="text-xs text-green-600 underline hover:text-green-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-xs text-red-600 underline hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowRationale(item.code)}
                        className="text-xs text-purple-600 underline hover:text-purple-800"
                      >
                        Why?
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendors = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Vendor Analysis</h3>
      {uniqueVendors.map((vendor, index) => {
        const vendorItems = aiSamples.filter(item => item.vendor === vendor);
        const vendorTotal = vendorItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const vendorConfidence = vendorItems.reduce((sum, item) => sum + (item.confidence || 0), 0) / vendorItems.length;
        
        return (
          <div key={vendor} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                  {index + 1}
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">{vendor}</h4>
                  <p className="text-sm text-gray-500">{vendorItems.length} items • ${vendorTotal.toLocaleString()} total</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Confidence</div>
                <div className="text-lg font-medium text-green-600">{(vendorConfidence * 100).toFixed(0)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {vendorItems.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">{item.description}</span>
                  <span className="text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">AI Analysis Details</h3>
      
      {/* Project Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Project Context</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Building Type:</span>
            <p className="font-medium text-blue-900">{projectData?.buildingType || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-blue-700">Square Footage:</span>
            <p className="font-medium text-blue-900">{projectData?.squareFootage || 0} sq ft</p>
          </div>
          <div>
            <span className="text-blue-700">Floors:</span>
            <p className="font-medium text-blue-900">{projectData?.numberOfFloors || 1}</p>
          </div>
          <div>
            <span className="text-blue-700">Files Analyzed:</span>
            <p className="font-medium text-blue-900">{projectData?.uploadedFiles?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">Compliance Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">NFPA 72 Fire Alarm Code compliance verified</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">Building code requirements analyzed</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">Industry best practices applied</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">🧠 Intelligent Data Sources</h2>
        <p className="text-sm text-gray-600">
          AI analyzes your uploaded documents and automatically sources vendors, materials, and estimation elements for your project.
        </p>
      </div>

      {/* AI Sourcing Toggle */}
      <div className="flex items-center space-x-3 mb-2">
        <input
          id="ai-sourcing-toggle"
          type="checkbox"
          checked={aiSourcingEnabled}
          onChange={() => setAiSourcingEnabled(v => !v)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <label htmlFor="ai-sourcing-toggle" className="text-sm text-gray-800 font-medium">
          Enable AI agent to source vendors, details, and materials as per project requirements
        </label>
      </div>

      {/* AI Vendor Discovery Panel */}
      {aiSourcingEnabled && (
        <div className="my-4">
          {/* Loading/Progress State */}
          {aiState === 'loading' && (
            <div role="status" className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-2">
              <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-blue-900 text-sm">
                AI Analysis: Processing documents and extracting estimation elements...
              </span>
            </div>
          )}
          
          {/* Error State */}
          {aiState === 'error' && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-2 flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-red-800 text-sm">{aiError}</span>
              <button 
                onClick={() => setAiState('loading')} 
                className="ml-4 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Success State with Tabs */}
          {aiState === 'success' && aiSamples.length > 0 && (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'items', label: 'Items', icon: '📋' },
                    { id: 'vendors', label: 'Vendors', icon: '🏢' },
                    { id: 'analysis', label: 'Analysis', icon: '🔍' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                        selectedTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {selectedTab === 'overview' && renderOverview()}
                {selectedTab === 'items' && renderItemsTable()}
                {selectedTab === 'vendors' && renderVendors()}
                {selectedTab === 'analysis' && renderAnalysis()}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-600">
                  💡 Edit quantities and prices to match your specific requirements
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-xs underline text-blue-700 hover:bg-blue-50 rounded px-2 py-1" 
                    onClick={() => setAiState('loading')}
                  >
                    Refresh Analysis
                  </button>
                  <button className="text-xs underline text-blue-700 hover:bg-blue-50 rounded px-2 py-1">
                    Configure Manual Connectors
                  </button>
                </div>
              </div>
            </div>
          )}

          {aiState === 'idle' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis Available</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload documents or images in the Requirements step to generate AI-sourced estimation elements.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 Go back to the Requirements step and upload project documents, diagrams, or specifications to get AI-powered analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rationale Modal */}
      {showRationale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 modal-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Rationale</h3>
              <button
                onClick={() => setShowRationale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700">
              {aiSamples.find(item => item.code === showRationale)?.rationale || 'No rationale available.'}
            </p>
          </div>
        </div>
      )}

      {/* Existing Data Source Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ERP System */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📊</div>
            <div>
              <h4 className="font-medium text-gray-900">ERP System</h4>
              <p className="text-xs text-gray-500">SAP, Oracle, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect ERP
          </button>
        </div>
        
        {/* CRM System */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">👥</div>
            <div>
              <h4 className="font-medium text-gray-900">CRM System</h4>
              <p className="text-xs text-gray-500">Salesforce, HubSpot, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect CRM
          </button>
        </div>
        
        {/* Project Management */}
        <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📋</div>
            <div>
              <h4 className="font-medium text-gray-900">Project Management</h4>
              <p className="text-xs text-gray-500">Jira, Asana, etc.</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect PM Tool
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">AI-Powered Data Source Integration</h4>
            <p className="text-sm text-blue-700 mt-1">
              The AI agent automatically analyzes your uploaded documents, extracts estimation elements, and recommends vendors based on project requirements. 
              You can edit quantities, specifications, and vendor selections to match your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3DataSources; 