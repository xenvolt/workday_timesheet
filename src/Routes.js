import React from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Homem from './pages/Homem';
import AdminLayout from './pages/Admin';
import ManagerLayout from './pages/Manager';
import UserProfile from './pages/UserProfile';
import EmployeeLayout from './pages/Employee';
import LeavePage from './pages/Leave';
import LoginPage from './pages/Login';
import ApprovalFlowPage from './pages/ApprovalFlow';
import './index.css'
import AdminDashboard from './pages/Dashboarda';
import LeavePagem from './pages/Leavem';
import ApprovalFlow from './pages/AdminApprovalPage';
import RegisterPage from './pages/Register';
import EmployeeDashboard from './pages/Dashboarde';
import ManagerDashboard from './pages/Dashboardm';
import ManagerTimesheetTrends from './pages/Manempti';
const employeeLinks = [
  { label: 'Dashboard', to: '/employee' },
  { label: 'Timesheet Management', to: '/employee/timesheet' },
  { label: 'User Profile', to: '/employee/profile' },
  { label: 'Apply Leave', to: '/employee/leave' },
  { label: 'Logout', to: '/' }
];
const managerLinks = [
  { label: 'Dashboard', to: '/manager' },
  { label: 'Timesheet Management', to: '/manager/timesheet' },
  { label: 'User Profile', to: '/manager/profile' },
  { label: 'Apply Leave', to: '/manager/leave' },
  { label: 'Leave Approval', to: '/manager/approve' },
  { label: 'Employee Timesheets', to: '/manager/trends' },
  { label: 'Logout', to: '/' }
];
const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'User Profile', to: '/admin/profile' },
  { label: 'Leave Approval', to: '/admin/approve' },
  { label: 'Logout', to: '/' }
];
export default function Rt() {
  const location = useLocation();
  const { name, email, role } = location.state || {};
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="timesheet" element={<Home />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="leave" element={<LeavePage />} />
      </Route>
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="timesheet" element={<Homem />} />
        <Route path="leave" element={<LeavePagem />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="approvals" element={<ApprovalFlowPage />} />
        <Route path="trends" element={<ManagerTimesheetTrends />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="approvals" element={<ApprovalFlow />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}
