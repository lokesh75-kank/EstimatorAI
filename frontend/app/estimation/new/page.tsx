"use client";

import EstimationWizard from '@/components/EstimationWizard/EstimationWizard';

export default function NewEstimationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full flex flex-col flex-1">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900">New Estimation</h1>
          <p className="mt-2 text-sm text-gray-600">
            Follow the steps below to create a new estimation
          </p>
        </div>
        <div className="flex-1 flex">
          <EstimationWizard />
        </div>
      </div>
    </div>
  );
} 