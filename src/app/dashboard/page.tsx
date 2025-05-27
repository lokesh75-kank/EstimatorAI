"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaFileAlt, FaChartLine, FaCog } from 'react-icons/fa';
import ClientLayout from '@/components/ClientLayout';

interface Estimation {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  lastModified: string;
}

export default function DashboardPage() {
  const [recentEstimations] = useState<Estimation[]>([
    {
      id: '1',
      name: 'Office Building Project',
      status: 'completed',
      createdAt: '2024-02-20',
      lastModified: '2024-02-21',
    },
    {
      id: '2',
      name: 'Shopping Mall Renovation',
      status: 'in_progress',
      createdAt: '2024-02-19',
      lastModified: '2024-02-20',
    },
    {
      id: '3',
      name: 'Apartment Complex',
      status: 'draft',
      createdAt: '2024-02-18',
      lastModified: '2024-02-18',
    },
  ]);

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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaFileAlt className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Estimations</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
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
                  <p className="text-2xl font-semibold text-gray-900">8</p>
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
                  <p className="text-2xl font-semibold text-gray-900">4</p>
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
              {recentEstimations.map((estimation) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 