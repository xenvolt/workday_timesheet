import React, { useState } from 'react';
import { useTimesheet } from '../../context/TimesheetContext';
export default function TimeEntryForm() {
  const { addEntry, entries } = useTimesheet();
  const [form, setForm] = useState({ date: '', project: '', task: '', hours: '', description: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleSubmit = () => {
    if (!form.date || !form.hours || !form.project || !form.task) return;
    addEntry(form);
    setForm({ date: '', project: '', task: '', hours: '', description: '' });
  };
  const weeklyHours = entries.reduce((acc, e) => acc + e.hours, 0);
  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h3 className="text-lg font-bold">Add Time Entry</h3>
      <input id= "date-input" name="date" type="date" className="w-full border p-2 rounded" value={form.date} onChange={handleChange} />
      <input name="project" placeholder="Project" className="w-full border p-2 rounded" value={form.project} onChange={handleChange} />
      <input name="task" placeholder="Task" className="w-full border p-2 rounded" value={form.task} onChange={handleChange} />
      <input name="hours" placeholder="Hours" type="number" className="w-full border p-2 rounded" value={form.hours} onChange={handleChange} />
      <textarea name="description" placeholder="Description (Optional)" className="w-full border p-2 rounded" value={form.description} onChange={handleChange} />
      <button onClick={handleSubmit} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Add Entry</button>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold">Week Status</p>
        <p className="text-gray-600"></p>
        <p className="text-xl text-gray-500">{weeklyHours}h till date</p>
      </div>
    </div>
  );
}
