import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { LeaveProvider } from './context/LeaveContext';
import { LeaveProviderm } from './context/LeaveContextm';
import { TimesheetProvider } from './context/TimesheetContext';
import { TimesheetProviderm } from './context/TimesheetContextm';
import { AuthProvider } from './context/AuthContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <AuthProvider>
  <TimesheetProvider>
    <TimesheetProviderm>
  <LeaveProvider>
    <LeaveProviderm>
    <App /></LeaveProviderm></LeaveProvider></TimesheetProviderm></TimesheetProvider></AuthProvider>
  </BrowserRouter>
);
