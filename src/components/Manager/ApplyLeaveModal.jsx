import React, { useState } from 'react';

export default function ApplyLeaveModal({ isOpen, onClose, onSubmit }) {
  const [type, setType] = useState('Annual Leave');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!from || !to) {
      setError('Please select both from and to dates.');
      return;
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      setError('From date cannot be after To date.');
      return;
    }

    const dayCount = Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    if (dayCount <= 0) {
      setError('Invalid duration.');
      return;
    }

    onSubmit({ type, from, to, reason, days: dayCount });
    setError('');
    onClose();
    setType('Annual Leave');
    setFrom('');
    setTo('');
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Leave Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option>Annual Leave</option>
              <option>Sick Leave</option>
              <option>Personal Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">Submit</button>
        </div>
      </div>
    </div>
  );
}