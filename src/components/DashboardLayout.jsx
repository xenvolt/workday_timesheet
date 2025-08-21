import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';

const DashboardLayout = ({ links }) => {
  return (
    <div className="flex">
      <Sidebar links={links} />
      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
