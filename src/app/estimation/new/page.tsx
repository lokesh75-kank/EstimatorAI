"use client";

import EstimationWizard from '@/components/EstimationWizard/EstimationWizard';

export default function NewEstimationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Estimation</h1>
          <p className="mt-2 text-sm text-gray-600">
            Follow the steps below to create a new estimation
          </p>
        </div>
        <EstimationWizard />
      </div>
    </div>
  );
} 