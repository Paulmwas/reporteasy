import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // Changed to navigate to login page
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Now clickable and navigates to home */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#25d366] to-[#43cd66] rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-[#111b21]" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
              ReportEasy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200 font-medium">
              Features
            </Link>
            <Link to="#how-it-works" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200 font-medium">
              How It Works
            </Link>
            <Link to="#about" className="text-[#5e5e5e] hover:text-[#25d366] transition-colors duration-200 font-medium">
              About
            </Link>
            <button 
              onClick={handleGetStarted}
              className="bg-[#25d366] hover:bg-[#43cd66] text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-[#111b21]`}></i>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link to="#features" className="text-[#5e5e5e] hover:text-[#25d366] font-medium">
                Features
              </Link>
              <Link to="#how-it-works" className="text-[#5e5e5e] hover:text-[#25d366] font-medium">
                How It Works
              </Link>
              <Link to="#about" className="text-[#5e5e5e] hover:text-[#25d366] font-medium">
                About
              </Link>
              <button 
                onClick={handleGetStarted}
                className="bg-[#25d366] hover:bg-[#43cd66] text-white px-6 py-2 rounded-full font-medium w-fit"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;