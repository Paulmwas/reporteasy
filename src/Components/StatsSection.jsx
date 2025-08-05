import React from 'react';

const StatsSection = () => {
  const stats = [
    {
      number: '10K+',
      label: 'Issues Reported',
      icon: 'fas fa-exclamation-triangle'
    },
    {
      number: '98%',
      label: 'Resolution Rate',
      icon: 'fas fa-check-circle'
    },
    {
      number: '24/7',
      label: 'Available',
      icon: 'fas fa-clock'
    },
    {
      number: '5min',
      label: 'Avg Response Time',
      icon: 'fas fa-bolt'
    }
  ];

  return (
    <section className="py-20 bg-[#111b21]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#25d366] to-[#43cd66] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className={`${stat.icon} text-white text-2xl`}></i>
              </div>
              <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                {stat.number}
              </div>
              <div className="text-[#5e5e5e] font-medium" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;