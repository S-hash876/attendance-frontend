import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function DayMarkings() {
  const loadMarkingCalendar = () => {
    console.log('Load Marking Calendar called');
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Day Markings (WFH / Leave)</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Mark WFH / Leave Days</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="markingEmp" className="block mb-1 font-medium">
                Select Employee
              </label>
              <select
                id="markingEmp"
                className="w-full border rounded px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {/* Dynamically loaded options */}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="markingMonth" className="block mb-1 font-medium">
                Select Month
              </label>
              <input
                type="month"
                id="markingMonth"
                className="w-full border rounded px-2 py-1"
                onChange={loadMarkingCalendar}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} style={{ color: '#f0f0f0' }} />
                <span>Regular Day</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} style={{ color: '#c5e1a5' }} />
                <span>Work From Home (WFH)</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} style={{ color: '#ffe082' }} />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} style={{ color: '#f3e5f5' }} />
                <span>Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDay} style={{ color: '#ffcdd2' }} />
                <span>Holiday</span>
              </div>
              <p className="mt-2">
                Click on a day to cycle through marking options: None → WFH → Leave → None
              </p>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center font-medium">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div id="markingCalendar" className="mt-4 grid grid-cols-7 gap-2">
              {/* Calendar days will be loaded here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayMarkings;
