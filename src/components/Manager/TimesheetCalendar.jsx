import React, { useRef, useState } from 'react';
import { useTimesheetm } from '../../context/TimesheetContextm';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameDay } from 'date-fns';
export default function TimesheetCalendar() {
  const { entries, weekStart, changeWeek } = useTimesheetm();
  const [view, setView] = useState('weekly');
  const [viewEntry, setViewEntry] = useState(null);
  const formRef = useRef(null);
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const handleAddClick = (dateStr) => {
    const form = document.getElementById('date-input');
    if (form) {
      form.value = dateStr;
      form.dispatchEvent(new Event('input', { bubbles: true }));
    }
    formRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const [monthStart, setMonthStart] = useState(new Date());
  const startDate = startOfWeek(startOfMonth(monthStart));
  const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = [];
  let current = startDate;
  while (current <= endDate) {
    calendarDays.push(current);
    current = addDays(current, 1);
  }
  return (
    <div className="col-span-3 bg-white p-6 rounded shadow relative">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${view === 'weekly' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setView('weekly')}
          >
            Weekly View
          </button>
          <button
            className={`px-3 py-1 rounded ${view === 'monthly' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setView('monthly')}
          >
            Monthly View
          </button>
        </div>
        {view === 'weekly' && (
          <div className="flex items-center gap-2">
            <button onClick={() => changeWeek(-1)} className="px-2 py-1 text-sm bg-gray-200 rounded">◀</button>
            <h2 className="text-md font-semibold">Week of {weekStart.toDateString()}</h2>
            <button onClick={() => changeWeek(1)} className="px-2 py-1 text-sm bg-gray-200 rounded">▶</button>
          </div>
        )}
      </div>
      {view === 'weekly' && (
        <>
          <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2 border-y">
            {dayMap.map((day, index) => (
              <div key={index}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border border-gray-300 divide-x divide-gray-300 rounded overflow-hidden min-h-[500px]">
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + index);
              const dateStr = date.toISOString().split('T')[0];
              const dayEntries = entries.filter((e) => e.date === dateStr);
              const isEven = index % 2 === 0;
              const bgColor = isEven ? 'bg-gray-50' : 'bg-white';

              return (
                <div key={index} className={`flex flex-col p-2 border-t border-b ${bgColor}`}>
                  <div className="text-center text-xs font-semibold text-gray-600">{date.getDate()}</div>
                  {dayEntries.length === 0 ? (
                    <button
                      onClick={() => handleAddClick(dateStr)}
                      className="text-gray-500 hover:underline text-sm mt-1"
                    >
                      + Add Entry
                    </button>
                  ) : (
                    dayEntries.map((entry, i) => (
                      <div
                        key={i}
                        className="bg-purple-100 text-gray-900 p-2 rounded w-full mt-1 cursor-pointer hover:bg-gray-200"
                        onClick={() => setViewEntry(entry)}
                      >
                        <div className="font-semibold text-xs">Project: {entry.project}</div>
                        <div className="text-xs">{entry.hours}h • {entry.task}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {view === 'monthly' && (
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() =>
              setMonthStart((prev) => {
                const newDate = new Date(prev);
                newDate.setMonth(prev.getMonth() - 1);
                return newDate;
              })
            }
            className="px-2 py-1 text-sm bg-gray-200 rounded"
          >
            ◀
          </button>
          <h2 className="text-md font-semibold">
            {monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() =>
              setMonthStart((prev) => {
                const newDate = new Date(prev);
                newDate.setMonth(prev.getMonth() + 1);
                return newDate;
              })
            }
            className="px-2 py-1 text-sm bg-gray-200 rounded"
          >
            ▶
          </button>
        </div>
      )}
      {view === 'monthly' && (
        <>
          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700 mt-2 mb-2">
            {dayMap.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map(date => {
              const entry = entries.find(e => isSameDay(new Date(e.date), date));
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => entry && setViewEntry(entry)}
                  className={`p-2 border text-xs text-gray-600 bg-gray-50 rounded transition-transform duration-200 ease-in-out 
                  ${entry ? "cursor-pointer hover:scale-[200] hover:shadow-lg" : ""}`}
                  style={{ height: '70px' }}
                >
                  <div className="font-semibold">{format(date, 'd')}</div>
                  {entry ? (
                    <div className="mt-1 text-gray-600">{entry.task} ({entry.hours}h)</div>
                  ) : (
                    <div className="mt-1 text-gray-400 italic">.</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {viewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
              onClick={() => setViewEntry(null)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-2">Entry Details</h3>
            <p><strong>Date:</strong> {viewEntry.date}</p>
            <p><strong>Project:</strong> {viewEntry.project}</p>
            <p><strong>Task:</strong> {viewEntry.task}</p>
            <p><strong>Hours:</strong> {viewEntry.hours}</p>
            {viewEntry.description && <p><strong>Description:</strong> {viewEntry.description}</p>}
          </div>
        </div>
      )}

      <div ref={formRef} />
    </div>
  );
}
