import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, endOfWeek, addWeeks, addDays } from 'date-fns';

const ManagerTimesheetTrends = () => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeWeekData, setEmployeeWeekData] = useState([]);
    const [weekOffset, setWeekOffset] = useState(0);
    const [currentWeekRange, setCurrentWeekRange] = useState('');

    const fetchTimesheetsForEmployee = async (email, offset) => {
        if (!email) return;

        try {
            const today = new Date('2025-06-09T00:00:00');
            const startDate = startOfWeek(addWeeks(today, offset), { weekStartsOn: 1 });
            const endDate = endOfWeek(addWeeks(today, offset), { weekStartsOn: 1 });

            const res = await fetch(`http://localhost:5000/api/employee/timesheet/email/${email}`);
            const timesheets = await res.json();
            
            const weeklyData = [];
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                weeklyData.push({
                    day: format(currentDate, 'EEE'),
                    hours: 0,
                    originalDate: format(currentDate, 'yyyy-MM-dd'),
                });
                currentDate = addDays(currentDate, 1);
            }
            
            timesheets.forEach(entry => {
                if (!entry.date) return;
                const entryDate = format(new Date(entry.date), 'yyyy-MM-dd');
                const matchingDay = weeklyData.find(day => day.originalDate === entryDate);
                
                if (matchingDay) {
                    const hrs = parseFloat(entry.hoursWorked ?? entry.hours ?? 0);
                    if (!isNaN(hrs)) {
                        matchingDay.hours = (matchingDay.hours || 0) + hrs;
                    }
                }
            });
            
            const formatted = weeklyData.map(({ day, hours }) => ({
                day,
                hours: parseFloat(hours.toFixed(2)),
            }));
            
            setEmployeeWeekData(formatted);
            setCurrentWeekRange(`${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`);
        } catch (err) {
            console.error('Error fetching employee weekly data:', err);
        }
    };

    useEffect(() => {
        if (!user || !user.email) return;
    
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/manager/timesheet/all?email=${user.email}`);
                const timesheets = await res.json();
    
                const hoursByEmployee = {};
                timesheets.forEach(entry => {
                    const { email, name, hours, hoursWorked } = entry;
                    const hrs = parseFloat(hoursWorked ?? hours ?? 0);
                    if (!email || isNaN(hrs)) return;
    
                    if (!hoursByEmployee[email]) {
                        hoursByEmployee[email] = { email, name: name ?? email, totalHours: 0 };
                    }
                    hoursByEmployee[email].totalHours += hrs;
                });
    
                const formatted = Object.values(hoursByEmployee).map(emp => ({
                    ...emp,
                    totalHours: parseFloat(emp.totalHours.toFixed(2)),
                }));
    
                setChartData(formatted);
    
                if (formatted.length > 0) {
                    setSelectedEmployee(formatted[0].email);
                }
            } catch (err) {
                console.error('Error fetching manager timesheet data:', err);
            }
        };
    
        fetchData();
    }, [user]);

    useEffect(() => {
        if (selectedEmployee) {
            fetchTimesheetsForEmployee(selectedEmployee, weekOffset);
        }
    }, [selectedEmployee, weekOffset]);

    const handleEmployeeClick = (email) => {
        setSelectedEmployee(email);
        setWeekOffset(0);
    };

    const handlePreviousWeek = () => {
        setWeekOffset(prev => prev - 1);
    };

    const handleNextWeek = () => {
        setWeekOffset(prev => prev + 1);
    };

    if (!user || !user.email) {
        return <div className="text-center p-4 text-red-600 font-semibold bg-red-100 rounded-md">Manager not logged in.</div>;
    }

    return (
        <div className="p-6 max-w-8xl mx-auto space-y-6 h-screen">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 h-1/2">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Employee Timesheet Trends</h2>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        onClick={(e) => {
                            if (e && e.activeLabel) {
                                const clicked = chartData.find(emp => emp.name === e.activeLabel);
                                if (clicked) handleEmployeeClick(clicked.email);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#4b5563" />
                        <YAxis dataKey="name" type="category" stroke="#4b5563" />
                        <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }} />
                        <Bar dataKey="totalHours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 h-1/2">
                {selectedEmployee ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Weekly Hours for <span className="text-indigo-600">{chartData.find(emp => emp.email === selectedEmployee)?.name}</span>
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={handlePreviousWeek} className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 transition">
                                    ← Previous
                                </button>
                                <span className="text-gray-600 font-medium text-sm w-40 text-center">
                                    {currentWeekRange}
                                </span>
                                <button onClick={handleNextWeek} className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 transition">
                                    Next →
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={employeeWeekData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="day" stroke="#4b5563" />
                                <YAxis stroke="#4b5563" />
                                <Tooltip contentStyle={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }} />
                                <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No employee selected.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerTimesheetTrends;