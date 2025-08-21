import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    addDays, 
} from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LeaveCard from "../components/Manager/LeaveCard";
import { useLeave } from "../context/LeaveContext";
import { User } from "lucide-react";
import UserProfile from "./UserProfile";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const EmployeeDashboard = () => {
    const { leaves } = useLeave();
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [leaveData, setLeaveData] = useState([]);
    const [timesheetData, setTimesheetData] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [checkInStatus, setCheckInStatus] = useState("");

    const [weekOffset, setWeekOffset] = useState(0);
    const [weeklyTimesheetData, setWeeklyTimesheetData] = useState([]);
    const [currentWeekName, setCurrentWeekName] = useState("");

    const handleCheckIn = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const response = await fetch(
                "http://localhost:5000/api/employee/attendance/checkin",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        timeIn: new Date().toLocaleTimeString(),
                        date: today,
                    }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                setCheckInStatus(data.message);
            } else {
                setCheckInStatus(data.error || "Check-in failed");
            }
        } catch (err) {
            console.error(err);
            setCheckInStatus("Check-in failed");
        }
    };

    useEffect(() => {
        const handleUnload = () => {
            const now = new Date();
            const date = now.toISOString().split("T")[0];
            const timeOut = now.toLocaleTimeString();

            navigator.sendBeacon(
                "http://localhost:5000/api/employee/attendance/timeout",
                new Blob([JSON.stringify({ email: user.email, date, timeOut })], {
                    type: "application/json",
                })
            );
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [user]);
    useEffect(() => {
        if (!user?.email) return;

        fetch(`http://localhost:5000/api/employee/leave/email/${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                if (!Array.isArray(data)) return;

                const approved = data.filter((entry) => entry.status === "Approved").length;
                const pending = data.filter((entry) => entry.status === "Pending").length;
                const rejected = data.filter((entry) => entry.status === "Rejected").length;
                const approvedbymanager = data.filter((entry) => entry.status === "Approved by Manager").length;
                const total = data.length;

                setLeaveData({ approved, approvedbymanager, pending, rejected, total });
            })
            .catch((err) => console.error("Leave fetch error:", err));

        fetch(`http://localhost:5000/api/employee/timesheet/email/${user.email}`)
            .then((res) => res.json())
            .then((data) => {
                setTimesheetData(data); 
                setActivityLog(
                    data.map((item) => ({
                        date: item.date,
                        task: item.task,
                        status: "Submitted",
                        hours: item.hours,
                    }))
                );
            })
            .catch((err) => console.error("Timesheet fetch error:", err));
    }, [user]);
    useEffect(() => {
        const today = new Date('2025-06-09T00:00:00'); 
        const startDate = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
        const endDate = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
        const weekDays = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            weekDays.push({
                date: format(currentDate, "EEE, MMM d"),
                hours: 0,
                originalDate: format(currentDate, 'yyyy-MM-dd'),
            });
            currentDate = addDays(currentDate, 1);
        }
        const finalFormattedData = weekDays.map(day => {
            const matchingEntry = timesheetData.find(entry => 
                format(new Date(entry.date), 'yyyy-MM-dd') === day.originalDate
            );
            return {
                date: day.date,
                hours: matchingEntry ? parseFloat(matchingEntry.hours) : 0,
            };
        });
        setWeeklyTimesheetData(finalFormattedData);
        setCurrentWeekName(`${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`);

    }, [weekOffset, timesheetData]);

    const totalLeave = leaveData?.total || 0;
    const approved = leaveData?.approved || 0;
    const pending = leaveData?.pending || 0;
    const rejected = leaveData?.rejected || 0;
    const approvedbymanager = leaveData?.approvedbymanager || 0;

    const pieChartData = [
        { name: "Approved", value: approved },
        { name: "Approved By Manager", value: approvedbymanager },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected },
    ];

    const progressPercent =
        totalLeave > 0 ? Math.round((approved / totalLeave) * 100) : 0;

    return (
        <div className="p-6 min-h-screen relative">
            <div className="flex justify-between items-center mb-6 relative">
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome, {user?.name || "User"}
                </h1>

                <div className="flex items-center space-x-4 relative">
                    <div className="flex items-center space-x-2">
                        {checkInStatus && (
                            <p className="text-sm text-green-600 font-medium whitespace-nowrap">
                                {checkInStatus}
                            </p>
                        )}
                        <button
                            onClick={handleCheckIn}
                            disabled={
                                checkInStatus === "Check-in successful" ||
                                checkInStatus === "Already checked in."
                            }
                            className={`px-5 py-2 rounded-md text-white font-medium ${checkInStatus === "Check-in successful" ||
                                checkInStatus === "Already checked in."
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {checkInStatus === "Check-in successful" ||
                                checkInStatus === "Already checked in."
                                ? "Checked In"
                                : "Check-In"}
                        </button>
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                        onClick={() => navigate("leave")}
                    >
                        Apply Leave
                    </button>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                        onClick={() => navigate("timesheet")}
                    >
                        Timesheet
                    </button>
                    <div className="relative">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <User size={20} />
                        </button>
                        {showProfile && (
                            <div className="absolute top-14 right-0 z-50 bg-white shadow-xl rounded-lg p-4 w-64">
                                <UserProfile />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-80">
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg h-80">
                    <h3 className="text-xl font-semibold mb-4 text-white">Leave Status</h3>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={40}
                                outerRadius={70}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <h3 className="text-xl font-semibold mb-4 text-white">
                        Leave Approval Progress
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                            className="bg-green-500 h-6 rounded-full text-white text-sm text-center"
                            style={{ width: `${progressPercent}%` }}
                        >
                            {progressPercent}%
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg h-80">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        Timesheet Recent Activity
                    </h3>
                    <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "240px" }}>
                        <ul className="space-y-3">
                            <li className="flex justify-between text-sm font-bold border-b pb-2 sticky top-0 bg-white">
                                <span>Date</span>
                                <span>Task</span>
                                <span>Status</span>
                            </li>
                            {activityLog.length > 0 ? (
                                activityLog.map((activity, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between text-sm border-b pb-2"
                                    >
                                        <span>{activity.date}</span>
                                        <span className="text-gray-500">{activity.task}</span>
                                        <span className="text-green-600">{activity.status}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No recent activity.</li>
                            )}
                        </ul>
                    </div>
                    <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
                </div>
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg h-80">
                    <h3 className="text-xl font-semibold mb-4 text-white">Leave Details</h3>
                    <div className="flex gap-4 justify-center items-center py-2 h-32">
                        <LeaveCard type="Annual" used={8} total={20} color="red" /><t></t><t></t><t></t><t></t><t></t>
                        <LeaveCard type="Sick" used={3} total={10} color="yellow" />
                    </div>
                    <div className="flex gap-4 justify-center items-center py-2 h-16">
                        <LeaveCard type="Personal" used={1} total={5} color="blue" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Timesheet Overview</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setWeekOffset((prev) => prev - 1)}
                                className="bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-300"
                            >
                                ← Back
                            </button>
                            <span className="text-gray-600 font-medium text-sm">
                                {currentWeekName}
                            </span>
                            <button
                                onClick={() => setWeekOffset((prev) => prev + 1)}
                                className="bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-300"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyTimesheetData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hours" fill="#3B82F6" name="Hours Worked" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
};
export default EmployeeDashboard;