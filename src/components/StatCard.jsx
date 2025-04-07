import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_BASE_URL } from '../apiConfig';

function StatCard({ icon, value, label, bgClass ,onClick }) {
  return (
    <div onClick={onClick} 
    className="bg-white relative overflow-hidden rounded-lg shadow p-4 flex items-center cursor-pointer transform hover:-translate-y-1 transition">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${bgClass}`} >
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>
      <div className="ml-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
      <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
        <FontAwesomeIcon icon={icon} className="text-7xl text-gray-200" />
      </div>
    </div>
  );
}

export default StatCard;
