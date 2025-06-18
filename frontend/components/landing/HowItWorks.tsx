"use client";

import React from 'react';
import Link from 'next/link';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Project",
      description: "Set up your project with client details, building specifications, and requirements. Our intuitive wizard guides you through every step.",
      icon: "📋",
      color: "from-blue-500 to-indigo-600",
      features: ["Project details", "Building specs", "Requirements"]
    },
    {
      number: "02",
      title: "Connect Data Sources",
      description: "Integrate your existing systems—ERP, CRM, inventory—or upload documents. Our AI automatically extracts and normalizes the data.",
      icon: "🔗",
      color: "from-green-500 to-emerald-600",
      features: ["System integration", "Document upload", "Data normalization"]
    },
    {
      number: "03",
      title: "AI Analysis & Estimation",
      description: "Our AI analyzes requirements, applies industry rules, and generates accurate cost estimates with detailed BOM breakdowns.",
      icon: "🤖",
      color: "from-purple-500 to-pink-600",
      features: ["AI analysis", "BOM generation", "Cost calculation"]
    },
    {
      number: "04",
      title: "Review & Export",
      description: "Review the estimation, make adjustments if needed, and export professional proposals ready for client presentation.",
      icon: "📊",
      color: "from-orange-500 to-red-600",
      features: ["Cost review", "Proposal generation", "Export options"]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> 4 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From project setup to final proposal, our AI-powered platform streamlines your entire estimation workflow. 
            No complex setup, no steep learning curve—just accurate results in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-orange-200 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10">
                <div className="text-center">
                  {/* Step Number & Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl shadow-lg mb-4`}>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 text-left">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                See It in Action
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Watch how our AI transforms a complex fire & security project into a detailed, 
                accurate estimate in under 5 minutes.
              </p>
              
              {/* Demo Video Placeholder */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-8">
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-white text-lg font-medium">Demo Video Coming Soon</p>
                    <p className="text-blue-200 text-sm">See the full estimation process in action</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Try It Yourself
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 