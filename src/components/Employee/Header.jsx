import React from 'react';
import { useTimesheet } from '../../context/TimesheetContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, UserCheck, ClipboardCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { entries, getCurrentWeekRange } = useTimesheet();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { start, end } = getCurrentWeekRange();

  const weeklyEntries = entries.filter((e) => {
    const date = new Date(e.date);
    return date >= start && date <= end;
  });

  const weeklyHours = weeklyEntries.reduce((acc, e) => acc + e.hours, 0);
  const daysWorked = [...new Set(weeklyEntries.map((e) => e.date))].length;
  const target = 40;
  const percent = Math.min(100, Math.round((weeklyHours / target) * 100));

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-gray-600 shadow p-6 rounded-lg flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-400 rounded-lg flex flex-col justify-center items-center shadow">
          <Clock className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Timesheet Management</h1>
          <p className="text-white text-sm">Track weekly work hours and submit for approval</p>
          <div className="flex items-center gap-3 text-sm mt-2">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1 text-white">
              <ClipboardCheck className="w-4 h-4" /> Weekly Submissions
            </span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1 text-white">
              <UserCheck className="w-4 h-4" /> Manager Approval
            </span>
          </div>
          <p className="text-sm text-white mt-2">
            <span className="font-medium">Logged in as:</span> {user?.name || 'User'} ({user?.role})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="w-28 h-28 bg-gray-100 rounded-lg flex flex-col justify-center items-center shadow">
          <p className="text-gray-500 text-sm">Hours</p>
          <p className="text-3xl font-bold text-gray-700">{weeklyHours}</p>
          <p className="text-xs text-gray-500 mt-1">This Week</p>
        </div>

        <div className="w-28 h-28 bg-gray-100 rounded-lg flex flex-col justify-center items-center shadow">
          <p className="text-gray-500 text-sm">Days</p>
          <p className="text-3xl font-bold text-gray-700">{daysWorked}</p>
          <p className="text-xs text-gray-500 mt-1">Worked</p>
        </div>

        <div className="w-28 h-28 bg-gray-100 rounded-lg flex flex-col justify-center items-center shadow">
          <p className="text-gray-500 text-sm">Target</p>
          <p className="text-3xl font-bold text-gray-700">{percent}%</p>
          <p className="text-xs text-gray-500 mt-1">of 40h</p>
        </div>
      </div>
    </header>
  );
}
