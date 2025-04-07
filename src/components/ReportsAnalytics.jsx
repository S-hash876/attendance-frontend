import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function ReportsAnalytics() {
  const generateAttendanceReport = () => {
    console.log('Generate Attendance Report called');
  };

  const generatePayrollReport = () => {
    console.log('Generate Payroll Report called');
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Reports &amp; Analytics</h2>

      {/* Attendance Analytics Card */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Attendance Analytics</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="reportMonth" className="block mb-1 font-medium">
                Select Month
              </label>
              <input
                type="month"
                id="reportMonth"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="form-group flex items-end">
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 flex items-center gap-2"
                onClick={generateAttendanceReport}
              >
                <FontAwesomeIcon icon={faChartBar} />
                Generate Report
              </button>
            </div>
          </div>
          <div className="mt-4 h-72">
            <canvas id="attendanceReportChart"></canvas>
          </div>
        </div>
      </div>

      {/* Department-wise Payroll Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Department-wise Payroll</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="payrollReportMonth" className="block mb-1 font-medium">
                Select Month
              </label>
              <input
                type="month"
                id="payrollReportMonth"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="form-group flex items-end">
              <button
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 flex items-center gap-2"
                onClick={generatePayrollReport}
              >
                <FontAwesomeIcon icon={faChartPie} />
                Generate Report
              </button>
            </div>
          </div>
          <div className="mt-4 h-72">
            <canvas id="payrollReportChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalytics;
