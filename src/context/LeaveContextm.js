import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LeaveContextm = createContext();

export const LeaveProviderm = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 1, approved: 1, rejected: 0 });
  const [leaves, setLeaves] = useState([
    { type: 'Annual Leave', total: 10, used: 4 },
    { type: 'Sick Leave', total: 5, used: 2 },
    { type: 'Personal Leave', total: 4, used: 1 },
  ]);
  const [requests, setRequests] = useState([]);
  const fetchLeaveRequests = async () => {
    if (user?._id && user?.role?.toLowerCase() === 'manager') {
      try {
        const res = await fetch(`http://localhost:5000/api/manager/leave/email/${user.email}`);
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
        const statsCount = { pending: 1, approved: 1, rejected: 0 };
        data.forEach((req) => {
          const status = (req.status || '').toLowerCase();
          if (status === 'pending') statsCount.pending++;
          else if (status === 'approved') statsCount.approved++;
          else if (status === 'rejected') statsCount.rejected++;
        });

        setStats(statsCount);
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
      }
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [user?._id]);

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
      stage: 'Admin',
      submittedDate: new Date().toLocaleDateString(),
      timeline: [
        {
          role: 'Manager',
          date: new Date().toLocaleDateString(),
          comment: reason,
        },
      ],
    };

    try {
      const res = await fetch('http://localhost:5000/api/manager/leave', {
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
      await fetch(`http://localhost:5000/api/manager/leave/${id}`, {
        method: 'DELETE',
      });
      await fetchLeaveRequests();
    } catch (err) {
      console.error('Failed to delete leave request:', err);
    }
  };

  return (
    <LeaveContextm.Provider
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
    </LeaveContextm.Provider>
  );
};
export const useLeaveM = () => useContext(LeaveContextm);