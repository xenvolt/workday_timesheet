import React from 'react';
import { CalendarDays, UserCheck, ShieldCheck, Clock } from 'lucide-react';
import LeaveCard from './LeaveCard';
export default function LeaveHeader({ stats }) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white flex flex-col lg:flex-row justify-between gap-6">
      <div className="flex-1 min-w-[250px]">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Leave Management</h1>
            <p className="text-sm">
              Apply for leaves and track your leave balance with multi-level approval
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Multi-Level Approval
          </span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1">
            <UserCheck className="w-4 h-4" /> Manager → Admin
          </span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-4 h-4" /> {stats.pending} Pending
          </span>
        </div>
          <div className="flex gap-6 text-center">
          <div className="bg-white bg-opacity-10 px-4 py-2 rounded">
            <div className="text-lg font-bold">{stats.pending}</div>
            <div className="text-sm">Pending</div>
          </div>
          <div className="bg-white bg-opacity-10 px-4 py-2 rounded">
            <div className="text-lg font-bold">{stats.approved}</div>
            <div className="text-sm">Approved</div>
          </div>
          <div className="bg-white bg-opacity-10 px-4 py-2 rounded">
            <div className="text-lg font-bold">{stats.rejected}</div>
            <div className="text-sm">Rejected</div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 justify-end items-center flex-wrap">
        <LeaveCard type="Annual" used={4} total={10} color="blue" />
        <LeaveCard type="Sick" used={1} total={5} color="cyan" />
        <LeaveCard type="Personal" used={1} total={3} color="red" />
      </div>
    </div>
  );
}