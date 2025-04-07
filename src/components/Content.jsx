// Content.jsx
import React from 'react';
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import AttendanceHistory from './AttendanceHistory';
import HolidayCalendar from './HolidayCalendar';
import PayrollManagement from './PayrollManagement';
import LeaveCalendar from './Leave';

function Content({ activeSection, onSectionChange, editEmployee }) {
  return (
    <main className="flex-1 p-4 overflow-auto">
      {activeSection === 'dashboard' && <Dashboard onSectionChange={onSectionChange} />}
      {activeSection === 'employees' && <EmployeeManagement editEmployee={editEmployee} />}
      {activeSection === 'attendance' && <AttendanceHistory />}
      {activeSection === 'holidays' && <HolidayCalendar />}
      {activeSection === 'payroll' && <PayrollManagement />}
      {activeSection === 'leave-calendar' && <LeaveCalendar />}
    </main>
  );
}

export default Content;
