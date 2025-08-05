
// LandingPage.jsx
import React from 'react';
import NavBar from '../Components/NavBar';
import HeroSection from '../Components/HeroSection';
import FeaturesSection from '../Components/FeaturesSection';
import HowItWorksSection from '../Components/HowItWorksSection';
import StatsSection from '../Components/StatsSection';
import CTASection from '../Components/CTASection';
import Footer from '../Components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;