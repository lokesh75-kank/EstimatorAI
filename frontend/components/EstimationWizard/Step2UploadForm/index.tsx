import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [confirmedData, setConfirmedData] = useState<Record<string, boolean>>({});

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

  const renderFileCard = (doc: ExtractedDoc) => {
    const isConfirmed = confirmedData[doc.id];
    
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="text-2xl flex-shrink-0">
                {doc.documentType?.startsWith('image') ? '🖼️' : '📄'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  Detected as: {doc.detectedType}
                </div>
              </div>
            </div>
            <ConfidenceBadge confidence={doc.confidence} />
          </div>

          {doc.documentType?.startsWith('image') && (
            <motion.div
              className="mb-4 relative aspect-video"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={doc.url || ''}
                alt={doc.name}
                className="w-full h-full object-contain rounded-lg shadow-sm"
              />
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Building Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <BuildingDetailsCard
                data={doc.extractedData}
                onEdit={(field, value) => handleEditData(doc.id, field, value)}
                isConfirmed={isConfirmed}
              />
            </div>

            {/* Devices Section */}
            {doc.extractedData.devices && doc.extractedData.devices.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Detected Devices</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {doc.extractedData.devices.map((device: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                    >
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
                {Object.entries(doc.extractedData)
                  .filter(([key]) => !['project_type', 'square_footage', 'floors', 'zones', 'devices'].includes(key))
                  .map(([key, value]) => (
                    <ExtractedTextArea
                      key={key}
                      label={key.replace(/_/g, ' ').toUpperCase()}
                      value={value as string}
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
                className="flex justify-end mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() => handleConfirmData(doc.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
    if (!e.target.files) return;
    setIsSubmitting(true);
    setError(null);
    let extractedResults: any[] = [];
    try {
      for (const file of Array.from(e.target.files)) {
        const result = await (await import('@/services/documentService')).default.uploadDocument(file);
        
        // Add confidence scores and detected type
        const processedResult = {
          ...result,
          confidence: result.confidence || 0,
          detectedType: result.documentType || 'Unknown',
          status: 'parsed'
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
      setError(err.message || 'Failed to upload and extract document.');
    } finally {
      setIsSubmitting(false);
      e.target.value = ""; // Allow re-uploading the same file
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Main Upload Area */}
      <div className={`${extractedDocs.length > 0 ? 'lg:w-3/4' : 'w-full'} p-4 lg:p-6 overflow-y-auto`}>
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {extractedDocs.length === 0 ? (
            <>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Upload Documents</h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 lg:mb-8">
                Upload project documents to automatically extract key information.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />

              <div
                className={`border-2 border-dashed rounded-xl p-6 lg:p-12 text-center cursor-pointer transition-all duration-200
                  ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4 lg:space-y-6">
                  <div className="text-5xl lg:text-7xl">📄</div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </h3>
                  <p className="text-base lg:text-lg text-gray-500">or click to browse files</p>
                  <p className="text-xs lg:text-sm text-gray-400">
                    Supports: PDF, DOCX, JPG, PNG, ZIP
                  </p>
                </div>
              </div>
            </>
          ) : (
            extractedDocs.length === 1 ? (
              <div className="flex-1 flex flex-col justify-center">
                {renderFileCard(extractedDocs[0])}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 auto-rows-fr">
                <AnimatePresence>
                  {extractedDocs.map((doc) => (
                    <div key={doc.id} className="h-full">
                      {renderFileCard(doc)}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )
          )}

          {isSubmitting && (
            <div className="mt-6 lg:mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-sm lg:text-base text-gray-600">Processing documents...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 lg:mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm lg:text-base text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Panel */}
      {extractedDocs.length > 0 && (
        <div className="lg:w-1/4 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Project Summary</h3>
          </div>
          <div className="p-4">
            <MetadataPanel
              extractedDocs={extractedDocs}
              projectDetails={projectDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2UploadForm; 