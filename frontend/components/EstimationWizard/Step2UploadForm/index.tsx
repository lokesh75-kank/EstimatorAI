import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ConfidenceBadge from './components/ConfidenceBadge';
import BuildingDetailsCard from './components/BuildingDetailsCard';
import ExtractedTextArea from './components/ExtractedTextArea';
import MetadataPanel from './components/MetadataPanel';
import ParsedFieldInput from './components/ParsedFieldInput';
import { Step2UploadFormProps, ExtractedDoc } from './types';

const Step2UploadForm: React.FC<Step2UploadFormProps> = ({
  extractedDocs,
  setExtractedDocs,
  setIsSubmitting,
  setError,
  isSubmitting,
  error,
  projectDetails,
  setProjectDetails
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [confirmedData, setConfirmedData] = useState<Record<string, boolean>>({});
  const [dataSourceMode, setDataSourceMode] = useState<'upload' | 'connect'>('upload');

  const handleConfirmData = (docId: string) => {
    setConfirmedData(prev => ({
      ...prev,
      [docId]: true
    }));
  };

  const handleEditData = (docId: string, field: string, value: any) => {
    setExtractedDocs(prev => prev.map(doc => 
      doc.id === docId ? {
        ...doc,
        extractedData: {
          ...doc.extractedData,
          [field]: value
        }
      } : doc
    ));
    setConfirmedData(prev => ({
      ...prev,
      [docId]: false
    }));
  };

  const handleConnectDataSources = () => {
    // Navigate to data sources page
    router.push('/data-sources');
  };

  const renderFileCard = (doc: ExtractedDoc) => {
    const isConfirmed = confirmedData[doc.id];
    
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="text-2xl flex-shrink-0">
                {doc.documentType?.startsWith('image') ? '🖼️' : '📄'}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{doc.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  Detected as: {doc.detectedType}
                </div>
              </div>
            </div>
            <ConfidenceBadge confidence={doc.confidence} />
          </div>

          {doc.documentType?.startsWith('image') && (
            <motion.div
              className="mb-6 relative aspect-video"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={doc.url || ''}
                alt={doc.name}
                className="w-full h-full object-contain rounded-lg shadow-sm border border-gray-200"
              />
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Building Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <BuildingDetailsCard
                data={doc.extractedData}
                onEdit={(field, value) => handleEditData(doc.id, field, value)}
                isConfirmed={isConfirmed}
              />
            </div>

            {/* Devices Section */}
            {doc?.extractedData?.devices && doc.extractedData.devices.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Detected Devices</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {doc.extractedData.devices.map((device: { type: string; count: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700 truncate">{device.type}</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{device.count} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Additional Information</h5>
              <div className="space-y-3">
                {Object.entries(doc?.extractedData || {})
                  .filter(([key]) => !['project_type', 'square_footage', 'floors', 'zones', 'devices'].includes(key))
                  .map(([key, value]) => (
                    <ExtractedTextArea
                      key={key}
                      label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      value={value}
                      onChange={(newValue) => handleEditData(doc.id, key, newValue)}
                      isConfirmed={isConfirmed}
                      tooltip={`Extracted from ${doc.detectedType}`}
                    />
                  ))}
              </div>
            </div>

            {/* Confirmation Button */}
            {!isConfirmed && (
              <motion.div
                className="flex justify-end mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() => handleConfirmData(doc.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirm Extracted Data
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    let extractedResults: any[] = [];
    
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        // Create a new File object to ensure we have a fresh copy
        const fileCopy = new File([file], file.name, { type: file.type });
        
        // Upload and process the file
        const result = await (await import('@/services/documentService')).default.uploadDocument(fileCopy);
        
        // Add confidence scores and detected type
        const processedResult = {
          ...result,
          confidence: result.confidence || 0,
          detectedType: result.documentType || 'Unknown',
          status: 'parsed',
          id: Date.now().toString(), // Add a unique ID
        };

        // Auto-fill project details if confidence is high enough
        if (result && result.extractedData) {
          const { project_type, square_footage, floors, zones } = result.extractedData;
          if (project_type && result.confidence >= 85) {
            setProjectDetails((prev: any) => ({
              ...prev,
              buildingType: project_type,
              squareFootage: square_footage || prev.squareFootage,
              numberOfFloors: floors || prev.numberOfFloors,
              numberOfZones: zones || prev.numberOfZones,
              _autoFilledBuildingType: true,
              _autoFilledSquareFootage: !!square_footage,
            }));
          }
        }
        extractedResults.push(processedResult);
      }
      setExtractedDocs(extractedResults);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload and extract document.');
    } finally {
      setIsSubmitting(false);
      // Clear the input value after processing
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      const input = fileInputRef.current;
      if (input) {
        input.files = e.dataTransfer.files;
        handleFileChange({ target: { files: e.dataTransfer.files } } as any);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      {extractedDocs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Data Source</h3>
            <p className="text-sm text-gray-600">
              Upload documents or connect to existing data sources
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Documents Option */}
            <div 
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                dataSourceMode === 'upload' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setDataSourceMode('upload')}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h4 className="font-medium text-gray-900 mb-2">Upload Documents</h4>
                <p className="text-sm text-gray-600">
                  Upload PDFs, images, or other project documents
                </p>
              </div>
            </div>

            {/* Connect Data Sources Option */}
            <div 
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                dataSourceMode === 'connect' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setDataSourceMode('connect')}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🔗</div>
                <h4 className="font-medium text-gray-900 mb-2">Connect Data Sources</h4>
                <p className="text-sm text-gray-600">
                  Connect to ERP, CRM, or other business systems
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-upload Button */}
      {extractedDocs.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            onClick={() => {
              setExtractedDocs([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                setTimeout(() => {
                  fileInputRef.current?.click();
                }, 0);
              }
            }}
          >
            Re-upload Files
          </button>
        </div>
      )}

      {/* Upload Documents Mode */}
      {dataSourceMode === 'upload' && extractedDocs.length === 0 && (
        <div className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <h3 className="text-xl font-semibold text-gray-900">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-base text-gray-500">or click to browse files</p>
              <p className="text-sm text-gray-400">
                Supports: PDF, DOCX, JPG, PNG, ZIP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connect Data Sources Mode */}
      {dataSourceMode === 'connect' && extractedDocs.length === 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Data Sources</h3>
              <p className="text-sm text-gray-600">
                Connect to your existing business systems to automatically import project data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* ERP System */}
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="font-medium text-gray-900">ERP System</h4>
                    <p className="text-xs text-gray-500">SAP, Oracle, etc.</p>
                  </div>
                </div>
              </div>

              {/* CRM System */}
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <h4 className="font-medium text-gray-900">CRM System</h4>
                    <p className="text-xs text-gray-500">Salesforce, HubSpot, etc.</p>
                  </div>
                </div>
              </div>

              {/* Project Management */}
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📋</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Project Management</h4>
                    <p className="text-xs text-gray-500">Jira, Asana, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleConnectDataSources}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Manage Data Sources
              </button>
              <p className="text-xs text-gray-500 mt-2">
                You'll be redirected to the Data Sources page
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Display Uploaded Documents */}
      {extractedDocs.length > 0 && (
        <div className="space-y-6">
          {extractedDocs.length === 1 ? (
            renderFileCard(extractedDocs[0])
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {extractedDocs.map((doc) => (
                  <div key={doc.id}>
                    {renderFileCard(doc)}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {isSubmitting && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-600">Processing documents...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2UploadForm; 