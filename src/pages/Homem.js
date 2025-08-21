import React, { useState } from 'react';
import Header from '../components/Manager/Header';
import TimesheetCalendar from '../components/Manager/TimesheetCalendar';
import TimeEntryForm from '../components/Manager/TimeEntryForm';
import { TimesheetProviderm } from '../context/TimesheetContextm';
export default function Homem() {
  const [activeTab, setActiveTab] = useState('weekly');
  return (
    <TimesheetProviderm>
      <div className="min-h-screen bg-gray-100 p-6 font-sans">
        <Header />
          <div className="mt-8 grid grid-cols-4 gap-6">
            <TimesheetCalendar />
            <TimeEntryForm />
          </div>
      </div>
    </TimesheetProviderm>
  );
}