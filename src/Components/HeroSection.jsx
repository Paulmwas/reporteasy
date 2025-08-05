import React from 'react';
import DotGrid from './DotGrid';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#e6ffda] via-white to-[#e6ffda]">
      {/* DotGrid Background */}
      <div className="absolute inset-0 w-full h-full">
        <DotGrid
          dotSize={8}
          gap={20}
          baseColor="#43cd66"
          activeColor="#25d366"
          proximity={100}
          shockRadius={200}
          shockStrength={4}
          resistance={600}
          returnDuration={1.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-[#43cd66]/20 mb-8">
            <i className="fas fa-whatsapp text-[#25d366]"></i>
            <span className="text-[#111b21] font-medium">Powered by WhatsApp</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#111b21] mb-6 leading-tight" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
            Report Issues
            <span className="block text-[#25d366]">Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#5e5e5e] mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            Transform how your community reports infrastructure issues. Send text, images, or voice messages via WhatsApp and get real-time updates on resolution progress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-[#25d366] hover:bg-[#43cd66] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
              <i className="fas fa-whatsapp"></i>
              <span>Start Reporting</span>
            </button>
            <button className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#111b21] px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 border border-[#43cd66]/20 hover:border-[#43cd66]/40 flex items-center space-x-2">
              <i className="fas fa-play"></i>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats Preview */}
          
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <i className="fas fa-chevron-down text-[#25d366] text-2xl"></i>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
