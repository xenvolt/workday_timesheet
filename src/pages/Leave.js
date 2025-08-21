import React, { useState, useEffect } from 'react';
import { useLeave } from '../context/LeaveContext';
import { useAuth } from '../context/AuthContext';
import LeaveHeader from '../components/Employee/LeaveHeader';
import ApplyLeaveModal from '../components/Employee/ApplyLeaveModal';

export default function LeavePage() {
  const {
    stats,
    updateLeaveUsage,
    addLeaveRequest,
    deleteLeaveRequest,
    requests,
    fetchLeaveRequests,
  } = useLeave();

  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleApplyLeave = async ({ type, from, to, days, reason }) => {
    await addLeaveRequest({ type, from, to, days, reason });
    updateLeaveUsage(type, days, 'apply');
  };

  const handleDeleteRequest = async (id) => {
    await deleteLeaveRequest(id);
  };

  useEffect(() => {
    if (user?._id) {
      fetchLeaveRequests();
    }
  }, [user]);

  const getStatusColor = (status = '') => {
    if (status === 'Approved'||status==='approved') return 'bg-green-100 text-green-800';
    if (status === 'Approved by Manager') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Pending') return 'bg-blue-200 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredRequests = requests;

  return (
    <div className="p-6 space-y-6">
      <LeaveHeader stats={stats} />

      <div className="flex justify-end mt-6">
        <button
          className="bg-gray-600 text-white px-6 py-2 rounded"
          onClick={() => setModalOpen(true)}
        >
          + Apply for Leave
        </button>
      </div>

      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleApplyLeave}
      />

      {filteredRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Leave Requests Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRequests.map((req, idx) => (
              <div
                key={idx}
                className={`p-4 rounded shadow ${getStatusColor(req.status || 'Pending')}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{req.type}</div>
                    <div className="text-sm">From: {req.from} To: {req.to}</div>
                    <div className="text-sm">Days: {req.days}</div>
                    <div className="text-sm">Reason: {req.reason}</div>
                    <div className="font-bold mt-1">Status: {req.status || 'Pending'}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(req._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    ✕
                  </button>
                </div>
                {req.timeline?.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Approval Timeline:</div>
                    <ul className="ml-4 list-disc">
                      {req.timeline.map((t, i) => (
                        <li key={i}>
                          {t.name}-{t.role} on {t.date} — {t.comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}