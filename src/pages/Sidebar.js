import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-purple-700 text-white p-6 fixed">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`block px-4 py-2 rounded hover:bg-purple-600 transition-all ${
                location.pathname === link.to ? 'bg-purple-600' : ''
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;