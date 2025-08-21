import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
export default function ApprovalFlowPage() {
  const { user } = useAuth();
  const [statusTab, setStatusTab] = useState('pending');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [comment, setComment] = useState('');
  useEffect(() => {
    if (!user?.email) return;

    const fetchLeaves = async () => {
      setLoading(true);
      setError(null);
      const url = `http://localhost:5000/api/manager/leave/all?email=${user.email}&status=${statusTab}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Failed to fetch leave requests.');
        }
        const data = await res.json();
        setLeaveRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [statusTab, user]);
  useEffect(() => {
    if (!user?.email) return;

    const fetchCounts = async () => {
      try {
        const pendingRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=pending`);
        const approvedRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=approved`);
        const rejectedRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=rejected`);

        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();

        setCounts({
          pending: pendingData.length,
          approved: approvedData.length,
          rejected: rejectedData.length
        });
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };

    fetchCounts();
  }, [user]);
  const handleAction = async (id, action) => {
    if (!user || !user.role) return console.error('Missing user role');

    try {
      const res = await fetch(`http://localhost:5000/api/manager/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          comment: comment,
          role: user.role,
          name: user.name
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update leave status.');
      }
      setComment('');
      const refreshLeaves = async () => {
        const url = `http://localhost:5000/api/manager/leave/all?email=${user.email}&status=${statusTab}`;
        const leavesRes = await fetch(url);
        const leavesData = await leavesRes.json();
        console.log(leavesData);
        setLeaveRequests(leavesData);
      };

      const refreshCounts = async () => {
        const pendingRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=pending`);
        const approvedRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=approved`);
        const rejectedRes = await fetch(`http://localhost:5000/api/manager/leave/all?email=${user.email}&status=rejected`);

        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();

        setCounts({
          pending: pendingData.length,
          approved: approvedData.length,
          rejected: rejectedData.length
        });
      };

      refreshLeaves();
      refreshCounts();

    } catch (err) {
      console.error('Error updating leave status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const statusTabs = ['pending', 'approved', 'rejected'];

  const getStatusTabStyle = (tabKey) => {
    const base = "pb-2 px-4 rounded-t font-semibold cursor-pointer transition-colors duration-200";
    const active = "bg-orange-200 text-orange-800 border-b-4 border-orange-500";
    const inactive = "text-gray-500 hover:bg-gray-100";
    return `${base} ${statusTab === tabKey ? active : inactive}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manager Approval</h1>

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

        {loading && <p className="text-center text-gray-500 text-lg">Loading requests...</p>}
        {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}

        {!loading && leaveRequests.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-10">
            No {statusTab} requests found.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leaveRequests.map((req) => (
            <div key={req._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{req.type}</h3>
              <p className="text-gray-500 mb-4 text-sm">
                From: {req.from} to {req.to} • {req.days} days
              </p>

              <div className="space-y-2">
                <p className="font-medium text-gray-700">
                  <span className="text-gray-500">Employee:</span> {req.email}
                </p>
                <p className="font-medium text-gray-700">
                  <span className="text-gray-500">Reason:</span> {req.reason}
                </p>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-500 mr-2">Status:</span>
                  {req.status.toLowerCase() === 'pending' && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-bold rounded-full">
                      Pending
                    </span>
                  )}
                  {(req.status.toLowerCase() === 'approved'||req.status.toLowerCase()==='approved by manager') && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 text-xs font-bold rounded-full">
                      Approved
                    </span>
                  )}
                  {req.status.toLowerCase() === 'rejected' && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 text-xs font-bold rounded-full">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
              {req.status === 'Pending' && (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add approval comments..."
                    className="w-full border border-gray-300 rounded-lg p-3 mt-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors duration-200"
                      onClick={() => handleAction(req._id, 'reject')}
                    >
                      Reject
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors duration-200"
                      onClick={() => handleAction(req._id, 'approve')}
                    >
                      Approve
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
