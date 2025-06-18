"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  buildingType: string;
  squareFootage: number;
  clientName: string;
  projectLocation: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'in_progress' | 'completed'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        projectName: 'Downtown Office Complex',
        projectDescription: 'Fire & security system for 15-story office building',
        buildingType: 'office',
        squareFootage: 250000,
        clientName: 'ABC Corporation',
        projectLocation: 'Downtown, City',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        estimatedCost: 125000
      },
      {
        id: '2',
        projectName: 'Residential Tower A',
        projectDescription: 'Security system for luxury residential complex',
        buildingType: 'residential',
        squareFootage: 180000,
        clientName: 'Luxury Developers Inc',
        projectLocation: 'Uptown District',
        status: 'draft',
        priority: 'medium',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        projectName: 'Industrial Warehouse',
        projectDescription: 'Fire suppression system for manufacturing facility',
        buildingType: 'industrial',
        squareFootage: 500000,
        clientName: 'Manufacturing Co',
        projectLocation: 'Industrial Zone',
        status: 'completed',
        priority: 'high',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-25',
        estimatedCost: 250000,
        actualCost: 245000
      }
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const filteredProjects = projects.filter(project => 
    filter === 'all' ? true : project.status === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading projects...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your fire & security system projects
                </p>
              </div>
              <Link
                href="/projects/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'All Projects', count: projects.length },
                { key: 'draft', label: 'Drafts', count: projects.filter(p => p.status === 'draft').length },
                { key: 'in_progress', label: 'In Progress', count: projects.filter(p => p.status === 'in_progress').length },
                { key: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 text-xs text-gray-500">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-sm text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any projects yet."
                : `No projects with status "${filter.replace('_', ' ')}"`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/projects/new"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {project.clientName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(project.status)}
                      {getPriorityBadge(project.priority)}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {project.buildingType.charAt(0).toUpperCase() + project.buildingType.slice(1)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {project.squareFootage.toLocaleString()} sq ft
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {project.projectLocation}
                    </div>
                  </div>

                  {/* Cost Information */}
                  {project.estimatedCost && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Estimated Cost:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${project.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      {project.actualCost && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Actual Cost:</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${project.actualCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {project.status === 'draft' && (
                      <Link
                        href={`/estimation/new?projectId=${project.id}`}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                      >
                        Start Estimation
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 