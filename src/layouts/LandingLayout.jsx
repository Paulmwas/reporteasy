import React from 'react';
import { Outlet } from 'react-router-dom';

const LandingLayout = () => {
  return (
    <div className="landing-layout">
      {/* Landing page specific header/navigation */}
      <main>
        <Outlet /> {/* This renders the child routes */}
      </main>
      {/* Landing page specific footer */}
    </div>
  );
};

export default LandingLayout;