import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CogIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-800">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <BellIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <CogIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center space-x-2"
          >
            <UserCircleIcon className="w-8 h-8 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;