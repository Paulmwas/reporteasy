import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt'
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: 'fas fa-file-alt'
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      icon: 'fas fa-chart-line'
    },
    {
      name: 'Users',
      path: '/dashboard/users',
      icon: 'fas fa-users'
    },
    {
      name: 'Categories',
      path: '/dashboard/categories',
      icon: 'fas fa-tags'
    },
    {
      name: 'Leaderboard',
      path: '/dashboard/leaderboard',
      icon: 'fas fa-trophy'
    },
    {
      name: 'Notifications',
      path: '/dashboard/notifications',
      icon: 'fas fa-bell'
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: 'fas fa-cog'
    }
  ];

  return (
    <div className="flex h-screen bg-[#1A1A2E]">
      {/* Sidebar */}
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
              <i className="fas fa-chart-network text-[#1A1A2E] text-sm font-bold"></i>
            </div>
            <span className="text-xl font-bold">ReportEasy</span>
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

          {/* Quick Stats */}
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-[#C1FF72]/10 to-[#00D4B2]/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Total Reports</span>
                  <i className="fas fa-file-alt text-[#C1FF72] text-xs"></i>
                </div>
                <div className="text-lg font-bold text-white mt-1">1000</div>
              </div>
              
              <div className="bg-gradient-to-r from-[#00D4B2]/10 to-[#FFD60A]/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Active Users</span>
                  <i className="fas fa-users text-[#00D4B2] text-xs"></i>
                </div>
                <div className="text-lg font-bold text-white mt-1">342</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] flex items-center justify-center">
              <i className="fas fa-user text-[#1A1A2E] text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">administrator</p>
            </div>
            <div className="flex space-x-2">
              <button 
                className="p-2 text-gray-400 hover:text-[#FFD60A] hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                title="Notifications"
              >
                <i className="fas fa-bell text-xs"></i>
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-[#C1FF72] hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;