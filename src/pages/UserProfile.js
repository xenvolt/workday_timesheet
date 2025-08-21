import React, { useState } from 'react';
import { useTimesheet } from '../context/TimesheetContext';
import { useTimesheetm } from '../context/TimesheetContextm';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const { entries: employeeEntries } = useTimesheet();
  const { entries: managerEntries } = useTimesheetm();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Loading profile...</p>
      </div>
    );
  }

  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user.role === 'admin';
  const relevantEntries =
    user.role === 'manager'
      ? managerEntries
      : employeeEntries;

  const userEntries = relevantEntries.filter(
    e => e.name === user.name || e.email === user.email
  );

  const daysWorked = [...new Set(userEntries.map(e => e.date))].length;
  const totalWeeks = Math.ceil(daysWorked / 7);
  const totalHours = userEntries.reduce((acc, e) => acc + (e.hours || 0), 0);
  const weeklyAverage = totalWeeks > 0 ? totalHours / totalWeeks : 0;

  const getPerformance = (avg) => {
    if (avg >= 40) return 'Excellent';
    if (avg >= 30) return 'Good';
    if (avg >= 25) return 'Average';
    return 'Bad';
  };

  return (
    <div className="bg-white">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">User Profile</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="font-medium text-gray-600">Name:</div>
        <div>
          {isEditing ? (
            <input
              className="border border-gray-300 rounded px-2 py-1 w-full"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
          ) : (
            <span>{editedName}</span>
          )}
        </div>

        <div className="font-medium text-gray-600">Email:</div>
        <div>
          {isEditing ? (
            <input
              className="border border-gray-300 rounded px-2 py-1 w-full"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
            />
          ) : (
            <span>{editedEmail}</span>
          )}
        </div>

        <div className="font-medium text-gray-600">Role:</div>
        <div>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>

        {!isAdmin && (
          <>
            <div className="font-medium text-gray-600">Days Worked:</div>
            <div>{daysWorked}</div>

            <div className="font-medium text-gray-600">Performance:</div>
            <div>{getPerformance(weeklyAverage)}</div>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save' : 'Edit'} Profile
        </button>
      </div>
    </div>
  );
}
