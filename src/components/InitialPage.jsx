import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

function InitialPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Main Section: Split into two halves */}
      <div className="flex flex-col md:flex-row">
        {/* Left Half: Image */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <img
            src="https://via.placeholder.com/500"
            alt="Test Visual"
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Right Half: Navigation Buttons */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center items-center space-y-6">
          <h2 className="text-3xl font-semibold mb-4">Welcome to Xplor Rides</h2>
          <div className="w-full max-w-sm">
            <Link
              to="/attendance"
              className="w-full block text-center bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition"
            >
              Attendance Portal <span className="ml-2">&rarr;</span>
            </Link>
          </div>
          <div className="w-full max-w-sm">
            <Link
              to="/login_overlay"
              className="w-full block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Admin Portal <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InitialPage;
