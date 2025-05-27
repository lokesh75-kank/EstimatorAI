"use client";

import Link from "next/link";
import { FaProjectDiagram, FaRobot, FaFileInvoiceDollar, FaRegFilePdf, FaTachometerAlt } from "react-icons/fa";
import ClientLayout from '@/components/ClientLayout';

export default function HomePage() {
  return (
    <ClientLayout>
      <HomeContent />
    </ClientLayout>
  );
}

function HomeContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Estimator AI
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="btn-secondary flex items-center gap-2"
              >
                <FaTachometerAlt />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 mb-6">
            Estimator AI
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            AI-powered fire & security system cost estimation. Fast, code-compliant, and branded proposals in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/estimation/new"
              className="btn-primary text-lg px-8 py-3"
            >
              Start New Estimation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <FaProjectDiagram className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guided Intake</h3>
            <p className="text-gray-600">Upload RFQs, blueprints, and SOWs for instant analysis</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <FaRobot className="text-indigo-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">Smart extraction of key project details and requirements</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <FaFileInvoiceDollar className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Compliance</h3>
            <p className="text-gray-600">NFPA/IBC compliant estimates and recommendations</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <FaRegFilePdf className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Proposals</h3>
            <p className="text-gray-600">Professional, branded proposals in minutes</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your estimation process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading fire & security integrators using Estimator AI
          </p>
          <Link
            href="/estimation/new"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
} 