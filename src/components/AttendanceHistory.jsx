// src/components/AttendanceHistory.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function AttendanceHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [calendarHtml, setCalendarHtml] = useState('');
  const [employees, setEmployees] = useState([]);
  // New state for marking modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalCurrentStatus, setModalCurrentStatus] = useState('');
  const [modalSelectedStatus, setModalSelectedStatus] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_employees`)
      .then((response) => response.json())
      .then((data) => setEmployees(data.employees))
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  // Load the calendar with markings merged with holiday/weekend data.
  const loadHistoryCalendar = () => {
    const empSelect = document.getElementById('historyEmpCalendar');
    const month = document.getElementById('historyMonth').value;
    if (!empSelect.value || !month) {
      alert('Please select an employee and month');
      return;
    }
    const empData = JSON.parse(empSelect.value);
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    // Fetch markings for the employee and month
    fetch(`${API_BASE_URL}/get_markings?employee_id=${empData.employee_id}&month=${month}`)
      .then((response) => response.json())
      .then((markingsData) => {
        // Build a map from date to marking type (default is "Absent")
        const markingsMap = {};
        markingsData.markings.forEach((m) => {
          markingsMap[m.date] = m.type;
        });
        // Now also fetch holiday data for the month
        fetch(`${API_BASE_URL}/get_calendar_holidays?month=${month}`)
          .then((res) => res.json())
          .then((holidayData) => {
            const extraHolidays = new Set(holidayData.extra_holidays);
            const weekends = new Set(holidayData.weekends);

            let html = '<div class="calendar-header grid grid-cols-7 gap-2">';
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach((day) => {
              html += `<div class="font-semibold text-center">${day}</div>`;
            });
            html += '</div>';
            html += '<div class="grid grid-cols-7 gap-2 mt-2">';

            // Blank cells for the first-day offset
            for (let i = 0; i < firstDay; i++) {
              html += '<div class="invisible"></div>';
            }
            // Create a cell for each day in the month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              // Default status from markings (or "Absent")
              let status = markingsMap[dateStr] || 'Absent';
              let bgClass = '';
              // Check if the day is a weekend (as per holiday API response)
              if (weekends.has(dateStr)) {
                status = "Weekend";
                bgClass = 'bg-gray-300';
              } else if (extraHolidays.has(dateStr)) {
                status = "Holiday";
                bgClass = 'bg-blue-300';
              } else {
                // Otherwise, apply colors based on the marking
                if (status === 'WFH') bgClass = 'bg-yellow-200';
                else if (status === 'Fieldwork') bgClass = 'bg-blue-200';
                else if (status === 'Leave') bgClass = 'bg-red-200';
                else if (status === 'LOP') bgClass = 'bg-purple-200';
                else if (status === 'Attendance') bgClass = 'bg-green-200';
                else if (status === 'Absent') bgClass = 'bg-gray-400 text-white';
              }
              // Each day cell is clickable: opens modal to update marking.
              html += `
                <div class="calendar-day p-2 text-center rounded-md cursor-pointer ${bgClass}"
                     data-date="${dateStr}"
                     onClick="openMarkingModal('${dateStr}', '${status}')">
                  <div class="font-semibold">${day}</div>
                  <div class="text-sm">${status}</div>
                </div>
              `;
            }
            html += '</div>';
            setCalendarHtml(html);
          })
          .catch((err) => console.error('Error fetching holiday data:', err));
      })
      .catch((error) => console.error('Error loading markings:', error));
  };

  // Expose the openMarkingModal function for inline onClick events.
  window.openMarkingModal = (dateStr, status) => {
    setModalDate(dateStr);
    setModalCurrentStatus(status);
    setModalSelectedStatus(status); // default to current marking
    setModalVisible(true);
  };

  // Save the selected marking to the backend
  const handleModalSave = () => {
    const empSelect = document.getElementById('historyEmpCalendar');
    if (!empSelect.value) {
      alert('Employee not selected');
      return;
    }
    const empData = JSON.parse(empSelect.value);
    fetch(`${API_BASE_URL}/add_marking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: modalDate,
        employee_id: empData.employee_id,
        type: modalSelectedStatus,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        setModalVisible(false);
        loadHistoryCalendar();
      })
      .catch((error) => console.error('Error updating marking:', error));
  };

  return (
    <div id="section-attendance" className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Attendance History & Markings</h2>

      {/* Monthly Attendance Calendar with Markings */}
      <div className="bg-white rounded-lg shadow mt-4 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Monthly Attendance Calendar</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="historyEmpCalendar" className="block font-medium mb-1">
                Select Employee
              </label>
              <select
                id="historyEmpCalendar"
                className="w-full border rounded px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={JSON.stringify(emp)}>
                    {emp.employee_id} - {emp.employee_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="historyMonth" className="block font-medium mb-1">
                Select Month
              </label>
              <input
                type="month"
                id="historyMonth"
                className="w-full border rounded px-2 py-1"
                onChange={loadHistoryCalendar}
              />
            </div>
            <div className="form-group flex items-end">
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded flex items-center"
                onClick={loadHistoryCalendar}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Show Calendar
              </button>
            </div>
          </div>
          <div
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: calendarHtml }}
          />
        </div>
      </div>

      {/* Marking Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
            <h3 className="text-xl font-semibold mb-4">
              Update Marking for {modalDate}
            </h3>
            <div className="mb-4">
              <label htmlFor="markingSelect" className="block mb-1 font-medium">
                Select Status
              </label>
              <select
                id="markingSelect"
                className="w-full border rounded px-2 py-1"
                value={modalSelectedStatus}
                onChange={(e) => setModalSelectedStatus(e.target.value)}
              >
                <option value="Absent">Absent</option>
                <option value="Attendance">Attendance</option>
                <option value="WFH">Work From Home (WFH)</option>
                <option value="Fieldwork">Fieldwork</option>
                <option value="Leave">Leave</option>
                <option value="LOP">LOP</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setModalVisible(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded"
                onClick={handleModalSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceHistory;
