import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ApprovalFlow() {
  const { user } = useAuth();
  const [statusTab, setStatusTab] = useState('pending');
  const [leaveTypeTab, setLeaveTypeTab] = useState('employee');
  const [comment, setComment] = useState('');
  const [userMap, setUserMap] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/all')
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(user => {
          map[user.email] = { name: user.name, role: user.role };
        });
        setUserMap(map);
      })
      .catch(err => console.error("Failed to fetch user data:", err));
  }, []);

  const fetchAllLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const leavesRes = await fetch('http://localhost:5000/api/admin/all-leaves');
      if (!leavesRes.ok) {
        throw new Error('Failed to fetch all leaves.');
      }
      const leavesData = await leavesRes.json();
      setAllLeaves(leavesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch data. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) {
      fetchAllLeaves();
    }
  }, [user]);
  useEffect(() => {
    if (!allLeaves || allLeaves.length === 0) {
      setCounts({ pending: 0, approved: 0, rejected: 0 });
      setFilteredRequests([]);
      return;
    }
    const leavesForType = allLeaves.filter(leave => {
      if (isAdmin) {
        return leave.role?.toLowerCase() === leaveTypeTab;
      }
      return leave.email === user.email;
    });

    const pendingCount = leavesForType.filter(leave => 
      leave.role?.toLowerCase() === 'manager' 
        ? leave.status?.toLowerCase() === 'pending'
        : leave.status?.toLowerCase() === 'approved by manager'
    ).length;
    
    const approvedCount = leavesForType.filter(leave => 
      leave.status?.toLowerCase() === 'approved'
    ).length;
    
    const rejectedCount = leavesForType.filter(leave => 
      leave.status?.toLowerCase() === 'rejected'
    ).length;
  
    setCounts({
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    });
  
    const filtered = leavesForType.filter(leave => {
      if (statusTab === 'pending') {
        return leave.role?.toLowerCase() === 'manager'
          ? leave.status?.toLowerCase() === 'pending'
          : leave.status?.toLowerCase() === 'approved by manager';
      }
      return leave.status?.toLowerCase() === statusTab;
    });
  
    setFilteredRequests(filtered);
  }, [allLeaves, statusTab, leaveTypeTab, isAdmin, user, userMap]);
  
  const handleAction = async (id, action) => {
    if (!user || !user.role) {
      console.error('Missing user role');
      return;
    }
  
    try {
      const leave = filteredRequests.find(req => req._id === id);
      if (!leave) {
        console.error('Leave request not found in filtered list.');
        return;
      }
  
      const res = await fetch(`http://localhost:5000/api/${user.role.toLowerCase()}/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comment,
          role: user.role,
          name: user.name,
          type: leave.type 
        }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to update leave status.');
      }
  
      setComment('');
      fetchAllLeaves();
    } catch (err) {
      console.error('Error updating leave status:', err);
      setError('Failed to update status. Please try again.');
    }
  };
  
  const statusTabs = ['pending', 'approved', 'rejected'];

  const getStatusTabStyle = (tabKey) => {
    const base = "pb-2 px-4 rounded-t font-semibold cursor-pointer";
    const active = "bg-orange-200 text-orange-800 border-b-4 border-orange-500";
    const inactive = "text-gray-500 hover:bg-gray-100";
    return `${base} ${statusTab === tabKey ? active : inactive}`;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Approval Workflow {isAdmin ? '(Admin)' : ''}</h2>
      
      {isAdmin && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setLeaveTypeTab('employee')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${leaveTypeTab === 'employee' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Employee Leaves
          </button>
          <button
            onClick={() => setLeaveTypeTab('manager')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${leaveTypeTab === 'manager' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Manager Leaves
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {statusTabs.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setStatusTab(tabKey)}
            className={getStatusTabStyle(tabKey)}
          >
            {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} ({counts[tabKey]})
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-500">Loading requests...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      {!loading && filteredRequests.length === 0 && (
        <p className="text-gray-500 text-center">No {statusTab} requests found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((req) => {
          const reqStatus = req.status?.toLowerCase();
          const isActionable =
            (reqStatus === 'pending' || reqStatus === 'approved by manager') &&
            user.role?.toLowerCase() === 'admin';

          return (
            <div key={req._id} className="bg-white shadow-lg rounded-xl p-6 transition-transform transform hover:scale-105">
              <h3 className="text-lg font-bold mb-1">{req.type}</h3>
              <p className="text-gray-600 text-sm mb-2">
                From: {req.from} to {req.to} • {req.days} days
              </p>
              <p className="text-sm font-semibold text-gray-700">Employee: {userMap[req.email]?.name || 'Unnamed'}</p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Reason:</span> {req.reason}
              </p>

              <div className="mt-2 flex items-center">
                <span className="font-semibold text-sm mr-2">Status:</span>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  reqStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  reqStatus === 'approved' || reqStatus === 'approved by manager' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {reqStatus}
                </span>
              </div>

              {isActionable && (
                <div className="mt-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add approval comments..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex gap-4 mt-4">
                    <button
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                      onClick={() => handleAction(req._id, 'reject')}
                    >
                      Reject
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
                      onClick={() => handleAction(req._id, 'approve')}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-sm">
                <h4 className="font-bold mb-2 text-gray-800 border-b pb-1">Approval Timeline</h4>
                <ul className="space-y-3">
                  {req.timeline && req.timeline.map((t, idx) => {
                    const approverName = userMap[t.email]?.name || 'Unnamed';
                    return (
                      <li key={idx} className="border-l-2 border-gray-300 pl-4">
                        <span className="font-medium text-gray-800">
                          {t.name} ({t.role})
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Date: {t.date}</p>
                        <p className="text-xs text-gray-600 mt-1">Comment: {t.comment}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
