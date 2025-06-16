"use client";

import EstimationWizard from '@/components/EstimationWizard/EstimationWizard';

export default function NewEstimationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimation Steps</h2>
            <nav className="space-y-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {step}
                  </div>
                  <span className="text-sm text-gray-600">Step {step}</span>
                </div>
              ))}
            </nav>
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Tips</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Upload clear, readable documents</p>
                <p>• Fill in all required fields</p>
                <p>• Review AI suggestions carefully</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Form Section (60%) */}
          <div className="w-full lg:w-3/5 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">New Estimation</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Follow the steps below to create a new estimation
                </p>
              </div>
              <EstimationWizard />
            </div>
          </div>

          {/* Project Summary Section (40%) */}
          <div className="hidden lg:block w-2/5 border-l border-gray-200">
            <div className="sticky top-0 h-screen overflow-y-auto p-6 bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Summary</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">AI Confidence</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Document Analysis</span>
                      <span className="text-sm font-medium text-green-600">High</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto-fill Accuracy</span>
                      <span className="text-sm font-medium text-yellow-600">Medium</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Save as Draft
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Export Summary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 