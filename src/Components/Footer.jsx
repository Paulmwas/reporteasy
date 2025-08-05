import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#111b21] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#25d366] to-[#43cd66] rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation text-white"></i>
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                ReportEasy
              </span>
            </div>
            <p className="text-[#5e5e5e] leading-relaxed mb-6 max-w-md" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
              Transforming how communities report and resolve infrastructure issues through the power of WhatsApp and AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#1c1e21] rounded-lg flex items-center justify-center hover:bg-[#25d366] transition-colors duration-200">
                <i className="fab fa-twitter text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-[#1c1e21] rounded-lg flex items-center justify-center hover:bg-[#25d366] transition-colors duration-200">
                <i className="fab fa-linkedin text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-[#1c1e21] rounded-lg flex items-center justify-center hover:bg-[#25d366] transition-colors duration-200">
                <i className="fab fa-github text-white"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Features</a></li>
              <li><a href="#how-it-works" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">How It Works</a></li>
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Documentation</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
              Support
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1c1e21] pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#5e5e5e] mb-4 md:mb-0" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            © 2024 ReportEasy. Built for Kilimani Prop Tech Hackathon.
          </p>
          <div className="flex items-center space-x-2 text-[#5e5e5e]">
            <span>Made with</span>
            <i className="fas fa-heart text-[#25d366]"></i>
            <span>in Nairobi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;