import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const TimesheetContextm = createContext();

export const TimesheetProviderm = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weekStart, setWeekStart] = useState(new Date('2025-06-22'));
  const [seeded, setSeeded] = useState(false); 

  const dummyData = [
    { date: '2025-06-23', hours: 4, project: 'Bug report', task: 'Project UI' },
    { date: '2025-06-24', hours: 5, project: 'Backend', task: 'Internal Tasks' },
    { date: '2025-06-22', hours: 7, project: 'Frontend', task: 'Project Alpha' },
  ];

  useEffect(() => {
    const seedInitialEntries = async () => {
      if (user?.email && user?.role && !seeded) {
        try {
          const endpoint = `http://localhost:5000/api/manager/timesheet/email/${user.email}`;
          const res = await fetch(endpoint);
          const data = await res.json();

          if (Array.isArray(data) && data.length === 0) {
            if (user.role.toLowerCase() === 'employee') {
              const seededData = [];

              for (const entry of dummyData) {
                const response = await fetch(`http://localhost:5000/api/manager/timesheet`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...entry, email: user.email, role: user.role }),
                });
                const saved = await response.json();
                seededData.push(saved);
              }

              setEntries(seededData);
            } else {
              setEntries([]);
            }
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
      const response = await fetch(`http://localhost:5000/api/manager/timesheet`, {
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
    <TimesheetContextm.Provider
      value={{
        entries,
        addEntry,
        weekStart,
        changeWeek,
        getCurrentWeekRange,
      }}
    >
      {children}
    </TimesheetContextm.Provider>
  );
};

export const useTimesheetm = () => useContext(TimesheetContextm);