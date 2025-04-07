import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';
import { API_BASE_URL } from '../apiConfig';

function MainContainer() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editEmployeeData, setEditEmployeeData] = useState(null);

  const handleSectionChange = (section, payload) => {
    console.log("MainContainer: Changing section to", section, payload);
    setActiveSection(section);
    if (payload && payload.editEmployee) {
      setEditEmployeeData(payload.editEmployee);
    } else {
      setEditEmployeeData(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
 
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <img
            src="/api/placeholder/40/40"
            alt="Xplor Rides Logo"
            className="h-10 rounded-full"
          />
          <h1 className="text-xl font-bold">Xplor Rides</h1>
        </div>
       
      </header>
    
      <div className="flex flex-1">
        <Sidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
        <Content activeSection={activeSection} editEmployee={editEmployeeData} />
      </div>
    </div>
  );
}

export default MainContainer;
