import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
const LeaveContext = createContext();
export const LeaveProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [leaves, setLeaves] = useState([
    { type: 'Annual Leave', total: 20, used: 8 },
    { type: 'Sick Leave', total: 10, used: 2 },
    { type: 'Personal Leave', total: 5, used: 1 },
  ]);
  const [requests, setRequests] = useState([]);
  const fetchLeaveRequests = async () => {
  if (!user?.email || !user?.role) return;
  try {
    const role = user.role.toLowerCase();
    let url = '';

    if (role === 'employee') {
      url = `http://localhost:5000/api/employee/leave/email/${user.email}`;
    } else if (role === 'manager') {
      url = `http://localhost:5000/api/manager/leave/all?email=${user.email}`;
    } else if (role === 'admin') {
      url = `http://localhost:5000/api/admin/leave/all`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);

    if (role === 'employee') {
      const statsCount = { pending: 0, approved: 0, rejected: 0 };
      data.forEach((req) => {
        const status = (req.status || '').toLowerCase();
        if (status === 'pending') statsCount.pending++;
        else if (status.includes('approved')) statsCount.approved++;
        else if (status === 'rejected') statsCount.rejected++;
      });
      setStats(statsCount);
    }
  } catch (err) {
    console.error('Failed to fetch leave requests:', err);
  }
};

useEffect(() => {
  fetchLeaveRequests();
}, [user?.email]);

  const updateLeaveUsage = (type, days, action) => {
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.type === type
          ? {
              ...leave,
              used: action === 'apply' ? leave.used + days : leave.used - days,
            }
          : leave
      )
    );
  };

  const addLeaveRequest = async ({ type, from, to, days, reason }) => {
    const newRequest = {
      email: user.email,
      type,
      from,
      to,
      days,
      reason,
      role: user.role,
      status: 'Pending',
      stage: 'Manager',
      submittedDate: new Date().toLocaleDateString(),
      timeline: [
        {
          role: user.role,
          date: new Date().toLocaleDateString(),
          comment: reason,
        },
      ],
    };

    const endpoint ='http://localhost:5000/api/employee/leave';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });

      const saved = await res.json();
      setRequests((prev) => [...prev, saved]);
      setStats((prev) => ({ ...prev, pending: prev.pending + 1 }));
    } catch (err) {
      console.error('Failed to apply leave:', err);
    }
  };

  const deleteLeaveRequest = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/employee/leave/${id}`, {
        method: 'DELETE',
      });
      await fetchLeaveRequests(); 
    } catch (err) {
      console.error('Failed to delete leave request:', err);
    }
  };

  return (
    <LeaveContext.Provider
      value={{
        stats,
        leaves,
        requests,
        setRequests,
        updateLeaveUsage,
        addLeaveRequest,
        deleteLeaveRequest,
        fetchLeaveRequests,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};
export const useLeave = () => useContext(LeaveContext);