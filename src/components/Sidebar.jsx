// Sidebar.jsx
import React from 'react';

function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-solid fa-gauge-high', label: 'Dashboard' },
    { id: 'employees', icon: 'fa-solid fa-users', label: 'Employee Management' },
    { id: 'attendance', icon: 'fa-solid fa-calendar-check', label: 'Attendance History' },
    { id: 'holidays', icon: 'fa-solid fa-calendar-days', label: 'Holiday Calendar' },
    { id: 'payroll', icon: 'fa-solid fa-money-bill-wave', label: 'Payroll Management' },
    // Reports Analytics is now merged in Dashboard
    // Day Markings is merged into Attendance History
    { id: 'leave-calendar', icon: 'fa-solid fa-calendar-day', label: 'Leave Calendar' },
  ];

  return (
    <aside className="w-64 bg-white shadow p-4 sticky top-16 overflow-y-auto">
      <ul>
        {menuItems.map((item) => (
          <li key={item.id} className="mb-2">
            <button
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center p-2 w-full text-left rounded-md transition ${
                activeSection === item.id
                  ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-700'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              <i className={`${item.icon} w-5 text-center`}></i>
              <span className="ml-2">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
