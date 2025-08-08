import React from 'react';
import { NavLink } from 'react-router-dom';
    // {
    //   name: 'My Impact',
    //   path: '/community/impact',
    //   icon: 'fas fa-chart-pie'
    // },
const CommunitySidebar = () => {
  const navItems = [
    {
      name: 'Home',
      path: '/community',
      icon: 'fas fa-home'
    },
    {
      name: 'Report Issue',
      path: '/community/reports',
      icon: 'fas fa-plus-circle'
    },
    {
      name: 'Issue Map',
      path: '/community/map',
      icon: 'fas fa-map-marked-alt'
    },
    {
      name: 'Solutions Hub',
      path: '/community/solutions',
      icon: 'fas fa-lightbulb'
    },

    {
      name: 'Leaderboard',
      path: '/community/leaderboards',
      icon: 'fas fa-trophy'
    },
    {
      name: 'Community Chat',
      path: '/community/chat',
      icon: 'fas fa-comments'
    }
  ];

  return (
    <div className="flex h-screen bg-[#1A1A2E]">
      <div className="w-64 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-gray-700/50">
          <div 
            className="flex items-center space-x-3"
            style={{
              background: 'linear-gradient(135deg, #C1FF72 0%, #00D4B2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] flex items-center justify-center">
              <i className="fas fa-hands-helping text-[#1A1A2E] text-sm font-bold"></i>
            </div>
            <span className="text-xl font-bold">Community Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#C1FF72]/20 to-[#00D4B2]/20 text-[#C1FF72] border-l-4 border-[#C1FF72] shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700/30 hover:text-white hover:scale-105'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i className={`${item.icon} w-5 text-center mr-4 transition-colors duration-200 ${
                      isActive ? 'text-[#C1FF72]' : 'text-gray-400 group-hover:text-[#00D4B2]'
                    }`}></i>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-[#FFD60A] animate-pulse"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Community Quick Stats */}
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Community Pulse
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-[#C1FF72]/10 to-[#00D4B2]/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Issues Solved</span>
                  <i className="fas fa-check-circle text-[#C1FF72] text-xs"></i>
                </div>
                <div className="text-lg font-bold text-white mt-1">1,240</div>
              </div>
              
              <div className="bg-gradient-to-r from-[#00D4B2]/10 to-[#FFD60A]/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Active Volunteers</span>
                  <i className="fas fa-hands text-[#00D4B2] text-xs"></i>
                </div>
                <div className="text-lg font-bold text-white mt-1">87</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile - Community Version */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] flex items-center justify-center">
              <i className="fas fa-user-astronaut text-[#1A1A2E] text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Community Member</p>
              <p className="text-xs text-gray-400 truncate">Level 3 Contributor</p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-2 text-gray-400 hover:text-[#FFD60A] hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                title="Achievements"
              >
                <i className="fas fa-medal text-xs"></i>
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-[#C1FF72] hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                title="Settings"
              >
                <i className="fas fa-user-cog text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;