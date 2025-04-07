// src/components/HolidayCalendar.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function HolidayCalendar() {
  const [month, setMonth] = useState('');
  const [holidays, setHolidays] = useState(new Set());
  const [weekends, setWeekends] = useState(new Set());
  const [calendarHTML, setCalendarHTML] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  // Load calendar for the selected month using the API endpoint
  const loadCalendar = async (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);

    const [year, monthNum] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    try {
      const res = await fetch(`${API_BASE_URL}/get_calendar_holidays?month=${selectedMonth}`);
      const data = await res.json();

      // Create sets for weekends and extra holidays from the API response
      const weekendsSet = new Set(data.weekends);
      const holidaysSet = new Set(data.extra_holidays);
      setWeekends(weekendsSet);
      setHolidays(holidaysSet);

      // Build calendar HTML similar to your HTML code
      let html = '';

      // Add empty cells for the first week
      for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day" style="visibility:hidden;"></div>`;
      }

      // Create a cell for each day
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let className = 'calendar-day';

        // Add classes if the day is a weekend or holiday
        if (weekendsSet.has(dateStr)) className += ' day-weekend';
        if (holidaysSet.has(dateStr)) className += ' day-holiday';

        html += `
          <div class="${className}" data-date="${dateStr}">
            <div class="calendar-date">${day}</div>
            ${holidaysSet.has(dateStr) ? '<div><i class="fas fa-star" style="color: #ff6d00;"></i> Holiday</div>' : ''}
          </div>`;
      }
      setCalendarHTML(html);
    } catch (err) {
      console.error('Error loading calendar:', err);
    }
  };

  // Delegate click events to calendar days to toggle holiday status
  useEffect(() => {
    const calendarContainer = document.getElementById('calendarView');
    const handleClick = (e) => {
      const target = e.target.closest('.calendar-day');
      if (!target) return;
      const dateStr = target.getAttribute('data-date');
      if (!dateStr) return;
      toggleHoliday(dateStr);
    };

    if (calendarContainer) {
      calendarContainer.addEventListener('click', handleClick);
    }
    return () => {
      if (calendarContainer) {
        calendarContainer.removeEventListener('click', handleClick);
      }
    };
  }, [calendarHTML]);

  // Toggle a holiday on/off using the API endpoints
  const toggleHoliday = async (dateStr) => {
    const isHoliday = holidays.has(dateStr);
    try {
      if (isHoliday) {
        // Remove the holiday
        await fetch(`${API_BASE_URL}/remove_holiday?date=${dateStr}`, {
          method: 'DELETE',
        });
      } else {
        // Add the holiday
        await fetch(`${API_BASE_URL}/add_holiday`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr }),
        });
      }
      // Reload the calendar to reflect changes
      loadCalendar({ target: { value: month } });
    } catch (err) {
      console.error('Error toggling holiday:', err);
    }
  };

  // Add a holiday using the API endpoint (via button click)
  const addHoliday = async () => {
    if (!holidayDate) {
      alert('Please select a date');
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/add_holiday`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: holidayDate }),
      });
      alert('Holiday added successfully!');
      setHolidayDate('');
      setHolidayName('');
      loadCalendar({ target: { value: month } });
    } catch (err) {
      console.error('Error adding holiday:', err);
      alert('Error adding holiday');
    }
  };

  return (
    <div id="section-holidays" className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Holiday Calendar</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Global Holiday Management</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Month Picker */}
            <div className="form-group">
              <label htmlFor="monthPicker" className="block font-medium mb-1">Select Month</label>
              <input
                type="month"
                id="monthPicker"
                className="w-full border rounded px-2 py-1"
                onChange={loadCalendar}
              />
            </div>
            {/* Holiday Date Picker */}
            <div className="form-group">
              <label htmlFor="holidayDate" className="block font-medium mb-1">Add Holiday Date</label>
              <input
                type="date"
                id="holidayDate"
                className="w-full border rounded px-2 py-1"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>
            {/* Holiday Name Input */}
            <div className="form-group">
              <label htmlFor="holidayName" className="block font-medium mb-1">Holiday Name</label>
              <input
                type="text"
                id="holidayName"
                className="w-full border rounded px-2 py-1"
                placeholder="e.g., Independence Day"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>
            {/* Add Holiday Button */}
            <div className="form-group flex items-end">
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 flex items-center"
                onClick={addHoliday}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Holiday
              </button>
            </div>
          </div>
          <div className="mt-4">
            {/* Calendar Day Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-medium">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
            </div>
            {/* Calendar View */}
            <div
              id="calendarView"
              className="mt-2 grid grid-cols-7 gap-1"
              dangerouslySetInnerHTML={{ __html: calendarHTML }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HolidayCalendar;
