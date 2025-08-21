import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Clock, User, LogOut, CalendarDays, House } from 'lucide-react';
import { TimesheetProvider } from '../context/TimesheetContext';
export default function EmployeeLayout() {
  const menu = [
    { name: 'Dashboard', icon: <House size={20} />, path: '/employee' },
    { name: 'Timesheet Management', icon: <Clock size={20} />, path: '/employee/timesheet' },
    { name: 'Apply Leave', icon: <CalendarDays size={20} />, path: '/employee/leave' },
    { name: 'Logout', icon: <LogOut size={20} />, path: '/' },
  ];

  return (
    <TimesheetProvider>
    <div className="flex h-screen">
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-blue-200 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Employee Panel</h2>
        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded transition ${
                location.pathname === item.path ? 'bg-gray-600' : 'hover:bg-gray-400'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
    </TimesheetProvider>
  );
}
