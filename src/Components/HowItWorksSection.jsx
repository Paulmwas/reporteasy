import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      title: 'Report via WhatsApp',
      description: 'Send a message to our WhatsApp bot with details about the issue. Include photos, voice messages, or location pins.',
      icon: 'fas fa-whatsapp'
    },
    {
      step: '02',
      title: 'AI Processing',
      description: 'Our AI automatically categorizes your report and determines the priority level based on the issue type and urgency.',
      icon: 'fas fa-cogs'
    },
    {
      step: '03',
      title: 'Admin Review',
      description: 'The report is forwarded to the relevant authorities who can track and manage the issue through our dashboard.',
      icon: 'fas fa-user-shield'
    },
    {
      step: '04',
      title: 'Get Updates',
      description: 'Receive real-time updates on your report status and get notified when the issue has been resolved.',
      icon: 'fas fa-check-circle'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-[#e6ffda] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#111b21] mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
            How It Works
          </h2>
          <p className="text-xl text-[#5e5e5e] max-w-3xl mx-auto" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            Simple, fast, and effective. Report issues in just a few steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-[#25d366] mb-6 group-hover:bg-[#25d366] group-hover:text-white transition-all duration-300">
                <span className="text-2xl font-bold text-[#25d366] group-hover:text-white" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                  {step.step}
                </span>
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-[#43cd66]/10">
                <i className={`${step.icon} text-3xl text-[#25d366]`}></i>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#111b21] mb-4" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                {step.title}
              </h3>
              <p className="text-[#5e5e5e] leading-relaxed" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                {step.description}
              </p>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-[#25d366] to-[#43cd66] transform -translate-y-1/2 -translate-x-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;