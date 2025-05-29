"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaFileAlt, FaChartLine, FaCog } from 'react-icons/fa';
import ClientLayout from '@/components/ClientLayout';
import { estimationApi, Estimation, DashboardStats } from '@/services/api';

export default function DashboardPage() {
  const [recentEstimations, setRecentEstimations] = useState<Estimation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both estimations and stats in parallel
        const [estimations, dashboardStats] = await Promise.all([
          estimationApi.getEstimations(),
          estimationApi.getDashboardStats()
        ]);

        setRecentEstimations(estimations);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: Estimation['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Link
              href="/estimation/new"
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              New Estimation
            </Link>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaFileAlt className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Estimations</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaChartLine className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FaCog className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Estimations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Estimations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </div>
              ) : recentEstimations.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 mb-4">No estimations found</p>
                  <Link
                    href="/estimation/new"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create your first estimation
                  </Link>
                </div>
              ) : (
                recentEstimations.map((estimation) => (
                  <div key={estimation.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{estimation.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(estimation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(estimation.status)}`}>
                          {estimation.status.replace('_', ' ')}
                        </span>
                        <Link
                          href={`/estimation/${estimation.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 