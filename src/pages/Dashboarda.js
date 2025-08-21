/*http://localhost:5000/api/admin/timesheet/weekly/${email}*/
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, parseISO, isSameDay, isToday, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';
import UserProfile from './UserProfile';

const AdminDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedUserLeaves, setSelectedUserLeaves] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeWeekData, setEmployeeWeekData] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekRange, setCurrentWeekRange] = useState('');

  const { user } = useAuth();
  const [leave, setLeave] = useState([]);
  const [userMap, setUserMap] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/all')
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(user => {
          map[user.email] = {
            name: user.name,
            role: user.role
          };
        });
        setUserMap(map);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/recentl')
      .then(res => res.json())
      .then(data => setLeave(data))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  useEffect(() => {
    if (!user || !user.email) return;

    const fetchTimesheetSummary = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/timesheet/summary`);
        const timesheets = await res.json();

        const formatted = timesheets.map(entry => ({
          email: entry.email,
          name: entry.name || entry.email,
          totalHours: parseFloat(entry.totalHours ?? 0),
        }));

        setChartData(formatted);
      } catch (err) {
        console.error('Error fetching timesheet data:', err);
      }
    };

    fetchTimesheetSummary();
  }, [user]);

  useEffect(() => {
    const fetchApprovedLeaves = async () => {
      try {
        const employeeRes = await fetch('http://localhost:5000/api/admin/leave/approved/employee');
        const managerRes = await fetch('http://localhost:5000/api/admin/leave/approved/manager');

        const employeeLeaves = await employeeRes.json();
        const managerLeaves = await managerRes.json();

        setLeaves([...employeeLeaves, ...managerLeaves]);
      } catch (err) {
        console.error('Error fetching approved leave data:', err);
      }
    };
    fetchApprovedLeaves();
  }, []);

 const fetchTimesheetsForEmployee = async (email, offset) => {
  try {
    const today = new Date('2025-06-09T00:00:00');
    const startDate = startOfWeek(addWeeks(today, offset), { weekStartsOn: 1 });
    const endDate = endOfWeek(addWeeks(today, offset), { weekStartsOn: 1 });
    const res = await fetch(`http://localhost:5000/api/admin/timesheet/weekly/${email}?weekStart=${startDate.toISOString()}`);
    const weeklyData = await res.json();
  
    const formatted = Object.entries(weeklyData).map(([day, hours]) => ({
      day,
      hours: parseFloat(hours.toFixed(2))
    }));

    setEmployeeWeekData(formatted);
    setCurrentWeekRange(`${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`);
  } catch (err) {
    console.error('Error fetching employee weekly data:', err);
    setEmployeeWeekData([]);
  }
};
useEffect(() => {
        if (chartData.length > 0) {
            const defaultEmployeeEmail = 'a@gmail.com';
            const defaultEmployee = chartData.find(emp => emp.email === defaultEmployeeEmail);
            if (defaultEmployee) {
                
                setSelectedEmployee(defaultEmployee.email);
                
                fetchTimesheetsForEmployee(defaultEmployee.email, 0);
            }
        }
    }, [chartData]);
  
    useEffect(() => {
        if (selectedEmployee) {
            fetchTimesheetsForEmployee(selectedEmployee, weekOffset);
        }
    }, [selectedEmployee, weekOffset]);


const handleEmployeeClick = (email) => {
  setSelectedEmployee(email);
  setWeekOffset(0);
};
  
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  useEffect(() => {
    if (selectedEmployee) {
      fetchTimesheetsForEmployee(selectedEmployee, weekOffset);
    }
  }, [selectedEmployee, weekOffset]);

  const handleDateClick = (date) => {
    const clickedDate = parseISO(date);
    const dayLeaves = leaves.filter(leave => {
      const isApproved = leave.status === 'approved' || leave.status === 'approved by manager';

      if (isApproved) {
        const from = parseISO(leave.from);
        const to = parseISO(leave.to);
        return clickedDate >= from && clickedDate <= to;
      }
      return false;
    });
    setSelectedUserLeaves(dayLeaves);
  };

  const renderCalendar = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const approvedLeaves = leaves.filter(leave => {
        const isApproved = leave.status === 'approved' || leave.status === 'approved by manager';
        if (isApproved) {
          const from = parseISO(leave.from);
          const to = parseISO(leave.to);
          return day >= from && day <= to;
        }
        return false;
      });

      days.push({ date: new Date(day), leaveUsers: approvedLeaves });
    }

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            ◀
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            ▶
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, leaveUsers }) => (
            <div
              key={date.toISOString()}
              className={`p-2 border rounded cursor-pointer text-center 
              ${leaveUsers.length > 0 ? 'bg-green-100' : 'bg-white'} 
              ${isToday(date) ? 'border-2 border-blue-500' : ''}`}
              onClick={() => handleDateClick(date.toISOString())}
            >
              <div className="text-sm font-medium">{format(date, 'd')}</div>
              {leaveUsers.length > 0 && (
                <div className="text-xs text-green-600">{leaveUsers.length} on leave</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user || !user.email) {
    return <div className="p-4 text-center text-red-600">Admin not logged in.</div>;
  }

  return (
    <div className="p-1 space-y-4">
      <div className="flex justify-between items-center px-4 py-2 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name || 'Admin'}</h2>
        <div className="relative">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            onClick={() => setShowProfile(!showProfile)}
          >
            <UserCircle size={20} />
          </button>
          {showProfile && (
            <div className="absolute top-14 right-0 z-50 bg-white shadow-xl rounded-lg p-4 w-64">
              <UserProfile />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-4/5 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Leave Calendar</h3>
          {renderCalendar()}
        </div>
        <div className="w-1/10 bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2">Leaves on Selected Day</h3>
          {selectedUserLeaves.length > 0 ? (
            <ul className="list-disc ml-4 text-sm bg-gray-100">
              {selectedUserLeaves.map(l => (
                <li key={l._id}>
                  {l.name} ({l.role}) : <br></br>{format(parseISO(l.from), 'dd/MM/yyyy')} - {format(parseISO(l.to), 'dd/MM/yyyy')}<br></br> ({l.status})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Click a date to view leaves.</p>
          )}
        </div>
        <div className="w-1/10 bg-white shadow rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2">Recent Leaves (Pending)</h3>
          <ul className="text-sm space-y-2">
            {leave.length === 0 ? (
              <li>No pending leave requests.</li>
            ) : (
              leave.map(l => (
                <li key={l._id} className="border-b pb-1">
                  <strong>{l.name || l.email}</strong> ({l.role || 'Unknown'})<br />
                  {format(parseISO(l.from), 'MMM dd')} to {format(parseISO(l.to), 'MMM dd')}<br />
                  <em>{l.reason}</em>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-2/5 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700 text-center">
            Employee Timesheet Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  const clicked = chartData.find(emp => emp.name === e.activeLabel);
                  if (clicked) handleEmployeeClick(clicked.email);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#4b5563" />
              <YAxis dataKey="name" type="category" stroke="#4b5563" />
              <Tooltip />
              <Bar dataKey="totalHours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <span className="inline-block w-4 h-4 mr-2 bg-indigo-500 rounded-sm"></span>
            Hours Worked
          </div>
        </div>
        <div className="w-3/5 bg-white shadow rounded-lg p-6">
          {selectedEmployee ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Weekly Hours for{' '}
                  <span className="text-indigo-600">
                    {chartData.find(emp => emp.email === selectedEmployee)?.name}
                  </span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button onClick={handlePreviousWeek} className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 transition">
                    ← Previous
                  </button>
                  <span className="text-gray-600 font-medium text-sm w-40 text-center">
                    {currentWeekRange}
                  </span>
                  <button onClick={handleNextWeek} className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 transition">
                    Next →
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={employeeWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-24">Click a name in the chart to view weekly data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;