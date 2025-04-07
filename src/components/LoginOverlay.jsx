import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

function LoginOverlay() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Use a form so that pressing Enter also submits
  const handleSubmit = (e) => {
    e.preventDefault();
    // Check credentials
    if (username === 'admin' && password === '1234') {
      setError('');
      // Navigate to dashboard on success
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 w-80 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <img
            src="/api/placeholder/80/80"
            alt="Xplor Rides Logo"
            className="w-20 h-20 rounded-full mb-2"
          />
          <h2 className="text-xl font-bold">Xplor Rides</h2>
          <p>HR &amp; Finance Portal</p>
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <button type="submit" className="w-full bg-purple-700 text-white p-2 rounded-md">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginOverlay;
