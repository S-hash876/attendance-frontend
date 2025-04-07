// MainContainer.jsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';

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
      <Header />
      <div className="flex flex-1">
        <Sidebar activeSection={activeSection} setActiveSection={handleSectionChange} />
        <Content 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}  // Pass custom callback here!
          editEmployee={editEmployeeData} 
        />
      </div>
    </div>
  );
}

export default MainContainer;
