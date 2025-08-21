import React, { useState } from 'react';
import Header from '../components/Employee/Header';
import TimesheetCalendar from '../components/Employee/TimesheetCalendar';
import TimeEntryForm from '../components/Employee/TimeEntryForm';
import { TimesheetProvider } from '../context/TimesheetContext';
export default function Home() {
  return (
    <TimesheetProvider>
      <div className="min-h-screen bg-gray-100 p-6 font-sans">
        <Header />
          <div className="mt-8 grid grid-cols-4 gap-6">
            <TimesheetCalendar />
            <TimeEntryForm />
          </div>
      </div>
    </TimesheetProvider>
  );
}