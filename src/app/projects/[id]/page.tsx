'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useApi } from '@/hooks/useApi';
import { apiService } from '@/services/api';
import type { Project, Estimate } from '@/types/api';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    data: project,
    loading: projectLoading,
    error: projectError,
    execute: fetchProject,
  } = useApi<Project>(() => apiService.getProject(projectId));

  const {
    data: estimates,
    loading: estimatesLoading,
    error: estimatesError,
    execute: fetchEstimates,
  } = useApi<Estimate[]>(() => apiService.getEstimates(projectId));

  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);
  const [newEstimate, setNewEstimate] = useState<Partial<Estimate>>({
    totalCost: 0,
    breakdown: [],
    status: 'draft',
  });

  useEffect(() => {
    fetchProject();
    fetchEstimates();
  }, [projectId, fetchProject, fetchEstimates]);

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createEstimate(
        projectId,
        newEstimate as Omit<Estimate, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
      );
      setIsCreatingEstimate(false);
      setNewEstimate({
        totalCost: 0,
        breakdown: [],
        status: 'draft',
      });
      fetchEstimates();
    } catch (error) {
      console.error('Failed to create estimate:', error);
    }
  };

  if (projectLoading || estimatesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (projectError || estimatesError) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{projectError || estimatesError}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">Project not found</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-bold text-gray-900">Project Details</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{project.clientName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client Email</p>
                  <p className="text-gray-900">{project.clientEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-gray-900 capitalize">{project.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Building Type</p>
                  <p className="text-gray-900">{project.building.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Building Size</p>
                  <p className="text-gray-900">{project.building.size} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Floors</p>
                  <p className="text-gray-900">{project.building.floors}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Zones</p>
                  <p className="text-gray-900">{project.building.zones}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Estimates</h2>
                <button
                  onClick={() => setIsCreatingEstimate(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  New Estimate
                </button>
              </div>

              {isCreatingEstimate && (
                <form onSubmit={handleCreateEstimate} className="mb-6 space-y-4">
                  <div>
                    <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">
                      Total Cost
                    </label>
                    <input
                      type="number"
                      id="totalCost"
                      value={newEstimate.totalCost}
                      onChange={(e) =>
                        setNewEstimate((prev) => ({
                          ...prev,
                          totalCost: Number(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingEstimate(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Estimate
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {estimates?.map((estimate) => (
                    <li key={estimate.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600">
                              ${estimate.totalCost.toLocaleString()}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Created: {new Date(estimate.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                estimate.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : estimate.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : estimate.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {estimate.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-gray-500">
                            <p>Breakdown:</p>
                            <ul className="mt-1 space-y-1">
                              {estimate.breakdown.map((item, index) => (
                                <li key={index}>
                                  {item.category}: ${item.cost.toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 