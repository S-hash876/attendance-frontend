// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitialPage from './components/InitialPage';
import AttendancePortal from './components/AttendancePortal';
import LoginOverlay from './components/LoginOverlay';
import Dashboard from './components/Dashboard';
import MainContainer from './components/Header';
// import AdminPortal from './components/AdminPortal';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/attendance" element={<AttendancePortal />} />
        {/* <Route path="/admin" element={<AdminPortal />} /> */}
        <Route path="/login_overlay" element={<LoginOverlay />} />
        <Route path="/dashboard" element={<MainContainer />} />


      </Routes>
    </Router>
  );
}

export default App;
