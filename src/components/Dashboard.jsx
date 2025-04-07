// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { faUsers, faUserCheck, faUserTimes, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';
import AttendanceChart from './AttendanceChart';
import { Chart } from 'chart.js';
// import AnalyticsChart from './AnalyticsChart';


function Dashboard({ onSectionChange }) {
  // State for API data
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    total: 0,
    details: [],
  });
  const [anniversaries, setAnniversaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Modal visibility state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard_details`)
      .then((response) => response.json())
      .then((data) => {
        setAttendanceSummary(data.attendance_summary);
      })
      .catch((error) => console.error('Error fetching dashboard details:', error));

    fetch(`${API_BASE_URL}/anniversaries`)
      .then((response) => response.json())
      .then((data) => {
        setAnniversaries(data.anniversaries);
      })
      .catch((error) => console.error('Error fetching anniversaries:', error));

    fetch(`${API_BASE_URL}/get_employees`)
      .then((response) => response.json())
      .then((data) => {
        setEmployees(data.employees);
      })
      .catch((error) => console.error('Error fetching employees:', error));

  //  fetch(`${API_BASE_URL}/leave_analytics`)
  //  .then(response => response.json())
  //  .then(data => setAnalyticsData(data))
  //  .catch(error => console.error('Error fetching analytics:', error)); 
  }, []);

  // Event handlers
    // Add a console.log to verify click is triggered
    const handleEmployeesClick = () => {
      console.log("Dashboard: Manage Employees button clicked");
      if (onSectionChange) {
        onSectionChange('employees');
      }
    };


  // When the edit button is clicked on an employee row,
  // pass the employee data to the parent so that EmployeeManagement can open the edit modal.
  const handleEditEmployee = (employee) => {
    console.log("Editing employee:", employee);
    if (onSectionChange) {
      onSectionChange('employees', { editEmployee: employee });
    }
  };

  const handleDeleteEmployee = (employee) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      console.log("Deleting employee:", employee);
      setEmployees(employees.filter(emp => emp.employee_id !== employee.employee_id));
    }
  };

  const handleAttendanceClick = () => {
    setShowAttendanceModal(true);
  };

  const handleAnniversariesClick = () => {
    setShowAnniversaryModal(true);
  };

  // Render functions for modals and tables
  const renderAttendanceDetails = () => (
    <div className="table-responsive">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Employee ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceSummary.details && attendanceSummary.details.map((detail, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-4 py-2">{detail.employee_id}</td>
              <td className="px-4 py-2">{detail.employee_name}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  detail.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {detail.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnniversaryList = () => (
    <div className="table-responsive">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Employee ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {anniversaries.map((item) => (
            <tr key={item.employee_id} className="hover:bg-gray-100">
              <td className="px-4 py-2">{item.employee_id}</td>
              <td className="px-4 py-2">{item.employee_name}</td>
              <td className="px-4 py-2">{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEmployeeTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Designation</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Department</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Gross CTC</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Payment Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr key={emp.employee_id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{emp.employee_id}</td>
                <td className="px-4 py-2">{emp.employee_name}</td>
                <td className="px-4 py-2">{emp.designation}</td>
                <td className="px-4 py-2">{emp.department}</td>
                <td className="px-4 py-2">{emp.employment_type}</td>
                <td className="px-4 py-2">₹{emp.gross_ctc.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {emp.payment_status || 'Not Set'}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => handleEditEmployee(emp)} className="text-blue-600">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDeleteEmployee(emp)} className="text-red-600">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-2" colSpan="8">No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={faUsers}
          value={attendanceSummary.total}
          label="Total Employees"
          bgClass="bg-purple-700"
          onClick={handleEmployeesClick}
        />
        <StatCard
          icon={faUserCheck}
          value={attendanceSummary.present}
          label="Present Today"
          bgClass="bg-green-600"
          onClick={handleAttendanceClick}
        />
        <StatCard
          icon={faUserTimes}
          value={attendanceSummary.absent}
          label="Absent Today"
          bgClass="bg-red-600"
          onClick={handleAttendanceClick}
        />
        <StatCard
          icon={faBirthdayCake}
          value={anniversaries.length}
          label="Work Anniversaries"
          bgClass="bg-yellow-500"
          onClick={handleAnniversariesClick}
        />
      </div>

      {/* Attendance Chart Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Today's Attendance</h3>
          <button onClick={handleAttendanceClick} className="text-sm bg-purple-700 text-white px-2 py-1 rounded">
            View Details
          </button>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <AttendanceChart attendanceData={attendanceSummary} />
        </div>
      </div>

      {/* Current Employees Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Current Employees</h3>
          <button onClick={handleEmployeesClick} className="text-sm bg-purple-700 text-white px-2 py-1 rounded">
            Manage Employees
          </button>
        </div>
        {renderEmployeeTable()}
      </div>

      {/* Attendance Details Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg border border-green-300 p-6 w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-700">✅ Attendance Details</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded">
                Close
              </button>
            </div>
            {renderAttendanceDetails()}
          </div>
        </div>
      )}

      {/* Work Anniversaries Modal */}
      {showAnniversaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg border border-yellow-300 p-6 w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-yellow-700">🎉 Work Anniversaries</h3>
              <button onClick={() => setShowAnniversaryModal(false)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded">
                Close
              </button>
            </div>
            {anniversaries.length > 0 ? renderAnniversaryList() : <p className="text-gray-600">No work anniversaries today.</p>}
          </div>
        </div>
      )}

     {/* --- NEW Analytics Section (Reports integrated in Dashboard) --- */}
     {/* <div className="mt-8 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Attendance &amp; Leave Analytics</h3>
        <div className="h-64">
          {analyticsData ? (
            <AnalyticsChart data={analyticsData} />
          ) : (
            <p className="text-center text-gray-500">Loading analytics...</p>
          )}
        </div>
      </div> */}

      {/* (Modals for Attendance Details and Anniversaries remain unchanged) */}
  
    </div>
  );
}

export default Dashboard;
