"use client";

import React from 'react';
import Link from 'next/link';

const FeatureHighlights: React.FC = () => {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Estimation",
      description: "Advanced machine learning algorithms analyze project requirements and generate accurate cost estimates with industry-standard BOM rules.",
      benefits: ["95% accuracy rate", "Real-time pricing data", "NFPA compliance checks"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: "🔗",
      title: "Seamless Data Integration",
      description: "Connect your existing ERP, CRM, and inventory systems to automatically sync product catalogs, pricing, and customer data.",
      benefits: ["One-click setup", "Real-time sync", "Multiple system support"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: "📊",
      title: "Smart BOM Generation",
      description: "Intelligent bill of materials creation with automatic quantity calculations, vendor recommendations, and cost optimization.",
      benefits: ["Auto-quantity calculation", "Vendor matching", "Cost optimization"],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: "⚡",
      title: "Lightning Fast Processing",
      description: "Process complex projects in minutes instead of hours. Our AI engine handles document analysis, cost calculations, and proposal generation.",
      benefits: ["10x faster than manual", "Batch processing", "Instant results"],
      color: "from-orange-500 to-red-600"
    },
    {
      icon: "📋",
      title: "Professional Proposals",
      description: "Generate branded proposals with detailed cost breakdowns, compliance documentation, and professional formatting ready for client presentation.",
      benefits: ["Branded templates", "PDF export", "Email integration"],
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 Type II certification, end-to-end encryption, and role-based access controls for team collaboration.",
      benefits: ["SOC 2 certified", "End-to-end encryption", "Role-based access"],
      color: "from-gray-600 to-gray-800"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Professional Estimations</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered analysis to professional proposal generation, our platform provides all the tools you need to deliver accurate, compliant estimates faster than ever.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>

                {/* Benefits List */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Estimation Process?
            </h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Join hundreds of fire and security professionals who are already saving time and improving accuracy with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Free Trial
              </Link>
              <Link
                href="/estimation-demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights; 