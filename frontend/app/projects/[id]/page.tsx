"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  numberOfFloors: number;
  numberOfZones: number;
  clientName: string;
  clientEmail: string;
  projectLocation: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
  dataSources?: string[];
  documents?: string[];
}

interface Estimation {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  totalCost?: number;
  bomItems?: number;
  confidence?: number;
}

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingEstimation, setIsCreatingEstimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'estimations' | 'documents' | 'settings'>('overview');

  // Mock project data
  useEffect(() => {
    const mockProject: Project = {
      id: projectId,
      projectName: 'Downtown Office Complex',
      projectDescription: 'Fire & security system for 15-story office building with advanced access control and surveillance systems.',
      buildingType: 'office',
      squareFootage: 250000,
      numberOfFloors: 15,
      numberOfZones: 8,
      clientName: 'ABC Corporation',
      clientEmail: 'contact@abccorp.com',
      projectLocation: 'Downtown, City',
      status: 'draft',
      priority: 'high',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      dataSources: ['ERP System', 'CRM System'],
      documents: ['Floor Plans.pdf', 'Security Requirements.docx', 'Building Specifications.pdf']
    };

    const mockEstimations: Estimation[] = [
      {
        id: 'est-1',
        projectId: projectId,
        status: 'completed',
        createdAt: '2024-01-20T10:00:00Z',
        completedAt: '2024-01-20T10:15:00Z',
        totalCost: 125000,
        bomItems: 45,
        confidence: 92
      }
    ];

    setTimeout(() => {
      setProject(mockProject);
      setEstimations(mockEstimations);
      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  const handleCreateEstimation = async () => {
    setIsCreatingEstimation(true);
    setError(null);

    try {
      // Simulate AI estimation creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newEstimation: Estimation = {
        id: `est-${Date.now()}`,
        projectId: projectId,
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      setEstimations(prev => [newEstimation, ...prev]);

      // Simulate completion after 5 seconds
      setTimeout(() => {
        setEstimations(prev => prev.map(est => 
          est.id === newEstimation.id 
            ? {
                ...est,
                status: 'completed',
                completedAt: new Date().toISOString(),
                totalCost: Math.floor(Math.random() * 200000) + 50000,
                bomItems: Math.floor(Math.random() * 100) + 20,
                confidence: Math.floor(Math.random() * 20) + 80
              }
            : est
        ));
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'Failed to create estimation');
    } finally {
      setIsCreatingEstimation(false);
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Project['priority']) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' }
    };

    const config = priorityConfig[priority];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getEstimationStatusBadge = (status: Estimation['status']) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-sm text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
          <Link
            href="/projects"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/projects"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
                  <p className="text-sm text-gray-600">Project Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(project.status)}
                {getPriorityBadge(project.priority)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Info</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Client</span>
                  <p className="text-sm text-gray-900">{project.clientName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Location</span>
                  <p className="text-sm text-gray-900">{project.projectLocation}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Building Type</span>
                  <p className="text-sm text-gray-900 capitalize">{project.buildingType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Square Footage</span>
                  <p className="text-sm text-gray-900">{project.squareFootage.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Floors</span>
                  <p className="text-sm text-gray-900">{project.numberOfFloors}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Zones</span>
                  <p className="text-sm text-gray-900">{project.numberOfZones}</p>
              </div>
            </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                <button
                    onClick={handleCreateEstimation}
                    disabled={isCreatingEstimation}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingEstimation ? 'Creating...' : 'Create AI Estimation'}
                </button>
                  <Link
                    href={`/estimation/new?projectId=${project.id}`}
                    className="block w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
                  >
                    Manual Estimation
                  </Link>
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="block w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
                  >
                    Edit Project
                  </Link>
                </div>
              </div>
            </div>
                  </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'estimations', label: 'Estimations' },
                    { key: 'documents', label: 'Documents' },
                    { key: 'settings', label: 'Settings' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Description</h3>
                      <p className="text-gray-700">{project.projectDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📊</div>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mt-2">Data Sources</h4>
                        <p className="text-2xl font-bold text-blue-600">{project.dataSources?.length || 0}</p>
                        <p className="text-xs text-gray-600">Connected</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📄</div>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mt-2">Documents</h4>
                        <p className="text-2xl font-bold text-green-600">{project.documents?.length || 0}</p>
                        <p className="text-xs text-gray-600">Uploaded</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">💰</div>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mt-2">Estimations</h4>
                        <p className="text-2xl font-bold text-purple-600">{estimations.length}</p>
                        <p className="text-xs text-gray-600">Created</p>
                      </div>
                    </div>

                    {/* AI Agent Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Estimation Agent</h3>
                          <p className="text-gray-700 mb-4">
                            Our AI agent can automatically analyze your project requirements and create detailed cost estimates with BOM breakdowns.
                          </p>
                    <button
                            onClick={handleCreateEstimation}
                            disabled={isCreatingEstimation}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCreatingEstimation ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Estimation...
                              </span>
                            ) : (
                              'Create AI Estimation'
                            )}
                    </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

                {activeTab === 'estimations' && (
                  <div className="space-y-6">
                        <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Project Estimations</h3>
                      <button
                        onClick={handleCreateEstimation}
                        disabled={isCreatingEstimation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingEstimation ? 'Creating...' : 'New Estimation'}
                      </button>
                    </div>

                    {estimations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No estimations yet</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Create your first estimation using our AI agent or manual process.
                        </p>
                        <button
                          onClick={handleCreateEstimation}
                          disabled={isCreatingEstimation}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingEstimation ? 'Creating...' : 'Create First Estimation'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {estimations.map((estimation) => (
                          <div key={estimation.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Estimation #{estimation.id}</h4>
                                  <p className="text-sm text-gray-600">
                                    Created {new Date(estimation.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {getEstimationStatusBadge(estimation.status)}
                            </div>

                            {estimation.status === 'completed' && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                                  <p className="text-lg font-semibold text-gray-900">
                                    ${estimation.totalCost?.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">BOM Items:</span>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {estimation.bomItems}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Confidence:</span>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {estimation.confidence}%
                            </p>
                          </div>
                              </div>
                            )}

                            <div className="mt-4 flex space-x-2">
                              <Link
                                href={`/estimations/${estimation.id}`}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </Link>
                              <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                Export PDF
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Upload Document
                      </button>
                    </div>

                    {project.documents && project.documents.length > 0 ? (
                      <div className="space-y-4">
                        {project.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">📄</div>
                              <div>
                                <h4 className="font-medium text-gray-900">{doc}</h4>
                                <p className="text-sm text-gray-600">Uploaded on project creation</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                View
                              </button>
                              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                                Download
                              </button>
                        </div>
                          </div>
                        ))}
                        </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Upload project documents to help with estimation accuracy.
                        </p>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          Upload First Document
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>
                    <p className="text-gray-600">Project settings and configuration options will be available here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage; 