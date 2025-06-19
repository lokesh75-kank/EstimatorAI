"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Estimate {
  id: string;
  projectId: string;
  status: 'in_progress' | 'completed' | 'failed';
  estimatedCost: number;
  breakdown: {
    fireSuppression: number;
    securitySystem: number;
    monitoring: number;
    installation: number;
    permits: number;
  };
  confidence: number;
  createdAt: string;
  completedAt?: string;
  projectDetails?: {
    projectName: string;
    clientName: string;
    buildingType: string;
    squareFootage: number;
    projectLocation: string;
  };
}

const EstimateDetailPage: React.FC = () => {
  const params = useParams();
  const projectId = params.id as string;
  
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const response = await fetch(`/api/estimations?projectId=${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch estimate');
        }

        const data = await response.json();
        setEstimate(data);
      } catch (error) {
        console.error('Error fetching estimate:', error);
        setError('Failed to load estimate');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchEstimate();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">Estimate Not Found</div>
          <p className="text-gray-600 mb-4">{error || 'The estimate you are looking for does not exist.'}</p>
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Cost Estimate</h1>
                <p className="mt-1 text-sm text-gray-600">
                  AI-generated cost breakdown for your project
                </p>
              </div>
              <Link
                href="/projects"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Estimate Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Cost Estimate</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getConfidenceColor(estimate.confidence)}`}>
                    {getConfidenceLabel(estimate.confidence)}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${estimate.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(estimate.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Total Estimate */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Estimated Cost</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatCurrency(estimate.estimatedCost)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Generated on {new Date(estimate.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(estimate.breakdown).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              {estimate.projectDetails && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Name</p>
                    <p className="text-sm text-gray-900">{estimate.projectDetails.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Client</p>
                    <p className="text-sm text-gray-900">{estimate.projectDetails.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Building Type</p>
                    <p className="text-sm text-gray-900 capitalize">{estimate.projectDetails.buildingType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Square Footage</p>
                    <p className="text-sm text-gray-900">{estimate.projectDetails.squareFootage.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-sm text-gray-900">{estimate.projectDetails.projectLocation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/projects/${projectId}`}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Project Details
                </Link>
                <button className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                  Download PDF Report
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Share Estimate
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                  Request Revision
                </button>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Based on {estimate.projectDetails?.squareFootage.toLocaleString()} sq ft analysis</p>
                <p>• Industry-standard pricing applied</p>
                <p>• Local permit requirements included</p>
                <p>• Installation complexity factored in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetailPage; 