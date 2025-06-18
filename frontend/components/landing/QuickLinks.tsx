"use client";

import React from 'react';
import Link from 'next/link';

const QuickLinks: React.FC = () => {
  const links = [
    {
      title: "Create New Project",
      description: "Start a new estimation project with AI-powered analysis",
      icon: "🚀",
      href: "/projects/new",
      color: "from-blue-500 to-indigo-600",
      featured: true
    },
    {
      title: "Connect Data Sources",
      description: "Integrate your ERP, CRM, and inventory systems",
      icon: "🔗",
      href: "/data-sources",
      color: "from-green-500 to-emerald-600",
      featured: false
    },
    {
      title: "View Projects",
      description: "Manage and track all your estimation projects",
      icon: "📊",
      href: "/projects",
      color: "from-purple-500 to-pink-600",
      featured: false
    },
    {
      title: "Watch Demo",
      description: "See how our AI transforms estimation workflows",
      icon: "🎥",
      href: "/estimation-demo",
      color: "from-orange-500 to-red-600",
      featured: false
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your path to faster, more accurate fire & security estimations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`group relative block p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                link.featured 
                  ? 'bg-white shadow-xl border-2 border-blue-200 hover:shadow-2xl' 
                  : 'bg-white shadow-lg hover:shadow-xl border border-gray-200'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${link.color} rounded-xl mb-4 shadow-lg`}>
                  <span className="text-2xl">{link.icon}</span>
                </div>

                {/* Content */}
                <h3 className={`text-lg font-bold mb-2 ${
                  link.featured ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {link.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  link.featured ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {link.description}
                </p>

                {/* Arrow */}
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    link.featured ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Get Started
                  </span>
                  <svg className={`w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300 ${
                    link.featured ? 'text-blue-600' : 'text-gray-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Featured Badge */}
                {link.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Recommended
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${link.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free trial available</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks; 