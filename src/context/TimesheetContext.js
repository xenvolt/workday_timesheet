import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const TimesheetContext = createContext();

export const TimesheetProvider = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weekStart, setWeekStart] = useState(new Date('2025-06-08'));
  const [seeded, setSeeded] = useState(false); 

  const dummyData = [
    { date: '2025-06-08', hours: 2.5, project: 'Bug report', task: 'Training' },
    { date: '2025-06-10', hours: 3, project: 'Frontend', task: 'Internal Tasks' },
    { date: '2025-06-11', hours: 2, project: 'Frontend', task: 'Project Alpha' },
  ];

  useEffect(() => {
    const seedInitialEntries = async () => {
      if (user?.email && user?.role && !seeded) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/employee/timesheet/email/${user.email}`
          );
          const data = await res.json();

          if (Array.isArray(data) && data.length === 0) {
            const seededData = [];

            for (const entry of dummyData) {
              const response = await fetch(`http://localhost:5000/api/employee/timesheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...entry, email: user.email, role: user.role }),
              });
              const saved = await response.json();
              seededData.push(saved);
            }

            setEntries(seededData);
          } else {
            setEntries(data);
          }

          setSeeded(true); 
        } catch (err) {
          console.error('Failed to fetch or seed timesheet entries:', err);
        }
      }
    };

    seedInitialEntries();
  }, [user, seeded]);

  const addEntry = async (entry) => {
    const entryWithMeta = {
      ...entry,
      email: user.email,
      role: user.role,
      hours: parseFloat(entry.hours),
    };

    try {
      const response = await fetch(`http://localhost:5000/api/employee/timesheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryWithMeta),
      });

      const saved = await response.json();
      setEntries((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Failed to add timesheet entry:', err);
    }
  };
  const fetchAllTimesheets = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/employee/timesheet/all`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Admin failed to fetch all timesheets:", err);
    return [];
  }
};
  const changeWeek = (direction) => {
    setWeekStart((prev) => {
      const copy = new Date(prev.getTime());
      copy.setDate(copy.getDate() + direction * 7);
      return copy;
    });
  };

  const getCurrentWeekRange = () => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  return (
    <TimesheetContext.Provider
      value={{
        entries,
        addEntry,
        weekStart,
        changeWeek,
        getCurrentWeekRange,
        fetchAllTimesheets,
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
};

export const useTimesheet = () => useContext(TimesheetContext);