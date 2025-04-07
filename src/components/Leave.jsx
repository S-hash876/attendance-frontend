// src/components/LeaveCalendar.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

const departmentColors = {
  Tech: '#60A5FA',        // blue-400
  Sales: '#34D399',       // green-400
  Execution: '#FBBF24',   // yellow-400
  Finance: '#F87171',     // red-400
  Design: '#A78BFA',      // purple-400
  Media: '#F472B6',       // pink-400
  Miscellaneous: '#9CA3AF'// gray-400
};

function LeaveCalendar() {
  const [month, setMonth] = useState('');
  const [calendarHtml, setCalendarHtml] = useState('');
  const [leaveDetails, setLeaveDetails] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  // When month changes, load leave data for the calendar
  const loadLeaveCalendar = (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);
    fetch(`${API_BASE_URL}/get_leave_records?month=${selectedMonth}`)
    .then(response => response.json())
    .then(data => {
      // Use the key returned by the backend, which is leaveRecords.
      setLeaveDetails(data.leaveRecords || {});
      buildCalendar(selectedMonth, data.leaveRecords || {});
    })
    .catch(error => console.error('Error loading leave calendar:', error));
  
  };

  const buildCalendar = (selectedMonth, leaveCalendarData) => {
    const [year, monthNum] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    let html = '<div class="grid grid-cols-7 gap-1 text-center">';
    // Weekday headers
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
      html += `<div class="font-medium">${day}</div>`;
    });
    html += '</div><div class="grid grid-cols-7 gap-1 mt-2">';
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="invisible"></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const leaves = leaveCalendarData[dateStr] || [];
      // If there are leave records, pick a color based on the first employee's department
      let bgColor = leaves.length > 0 ? departmentColors[leaves[0].department] || '#D1D5DB' : '#F3F4F6';
      // Build the day cell
      html += `<div class="p-2 rounded cursor-pointer" style="background-color:${bgColor}" onClick="handleLeaveDayClick('${dateStr}')">
                <div class="font-semibold">${day}</div>
                ${leaves.length > 0 ? `<div class="text-xs">${leaves.length} Leave(s)</div>` : ''}
              </div>`;
    }
    html += '</div>';
    setCalendarHtml(html);
  };

  // Expose a handler for day clicks (attached to window)
  window.handleLeaveDayClick = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Leave Calendar</h2>
      <div className="mb-4">
        <label htmlFor="leaveMonth" className="block mb-1 font-medium">Select Month</label>
        <input type="month" id="leaveMonth" className="border rounded px-2 py-1" onChange={loadLeaveCalendar} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: calendarHtml }} />

      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Leave Details for {selectedDate}</h3>
              <button onClick={closeModal} className="text-red-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {leaveDetails[selectedDate] && leaveDetails[selectedDate].length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Employee ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Leave Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveDetails[selectedDate].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-100">
                        <td className="px-4 py-2">{item.employee_id}</td>
                        <td className="px-4 py-2">{item.employee_name}</td>
                        <td className="px-4 py-2">{item.department}</td>
                        <td className="px-4 py-2">{item.leave_type || 'Leave'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No leave records for this day.</p>
              )}
            </div>
            <div className="mt-4 text-right">
              <button onClick={closeModal} className="bg-gray-200 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveCalendar;
