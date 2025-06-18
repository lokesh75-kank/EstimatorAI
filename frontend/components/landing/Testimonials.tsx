import React from 'react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Cut our proposal time from days to hours.",
      author: "Acme Integrators",
      role: "Fire & Security Systems"
    },
    {
      quote: "Consistent pricing, zero compliance errors.",
      author: "SafeGuard Corp.",
      role: "Commercial Security"
    },
    {
      quote: "The AI suggestions are incredibly accurate.",
      author: "SecureTech Solutions",
      role: "Residential Security"
    }
  ];

  const partnerVendors = [
    "Honeywell",
    "Siemens",
    "Johnson Controls",
    "Bosch",
    "Tyco",
    "ADT"
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
            See what our customers are saying about AI Estimator.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-start mb-4">
                <svg className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <div className="flex-1">
                  <p className="text-gray-700 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Partner Vendor Logos */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Partner Vendors
          </h3>
          <div className="grid grid-cols-3 gap-6 py-12 opacity-60">
            {partnerVendors.map((vendor, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <span className="text-gray-600 font-medium text-sm">{vendor}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-sm text-gray-600">Estimates Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}; 