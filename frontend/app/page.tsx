"use client";

import React from 'react';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import HowItWorks from '@/components/landing/HowItWorks';
import QuickLinks from '@/components/landing/QuickLinks';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureHighlights />
        <HowItWorks />
        <QuickLinks />
      </main>
      <Footer />
    </div>
  );
} 