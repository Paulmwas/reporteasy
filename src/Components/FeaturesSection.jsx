import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments,
  faRobot,
  faMapMarkerAlt,
  faBell,
  faChartLine,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const FeaturesSection = () => {
  const features = [
    {
      icon: faComments,
      title: 'WhatsApp Integration',
      description: 'Report issues directly through WhatsApp using text, voice messages, images, or videos. No new apps to download.',
      color: 'from-[#25d366] to-[#43cd66]'
    },
    {
      icon: faRobot,
      title: 'AI Categorization',
      description: 'Our AI automatically categorizes and prioritizes reports based on urgency and type for faster resolution.',
      color: 'from-[#43cd66] to-[#25d366]'
    },
    {
      icon: faMapMarkerAlt,
      title: 'Location Tracking',
      description: 'Pin exact locations of issues with GPS coordinates for precise identification and faster response.',
      color: 'from-[#25d366] to-[#43cd66]'
    },
    {
      icon: faBell,
      title: 'Real-time Updates',
      description: 'Get instant notifications about the status of your reports - from received to in-progress to resolved.',
      color: 'from-[#43cd66] to-[#25d366]'
    },
    {
      icon: faChartLine,
      title: 'Admin Dashboard',
      description: 'Comprehensive web dashboard for authorities to track, manage, and resolve issues efficiently.',
      color: 'from-[#25d366] to-[#43cd66]'
    },
    {
      icon: faGlobe,
      title: 'Multilingual Support',
      description: 'Support for local languages ensures everyone in the community can participate effectively.',
      color: 'from-[#43cd66] to-[#25d366]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111b21] mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
            Powerful Features
          </h2>
          <p className="text-xl text-[#5e5e5e] max-w-3xl mx-auto" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            Everything you need to streamline issue reporting and resolution in your community
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#43cd66]/30 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <FontAwesomeIcon icon={feature.icon} className="text-white text-2xl" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#111b21] mb-4" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-[#5e5e5e] leading-relaxed" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;