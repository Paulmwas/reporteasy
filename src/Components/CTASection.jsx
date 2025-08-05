import React from 'react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#25d366] to-[#43cd66]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to transform your community reporting?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Start reporting issues in minutes with just WhatsApp.
        </p>
        <button className="bg-white text-[#25d366] hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          Get Started Now
        </button>
      </div>
    </section>
  );
};

export default CTASection;