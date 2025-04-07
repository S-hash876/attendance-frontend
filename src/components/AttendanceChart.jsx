import React, { useState, useEffect, useRef } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

function AttendanceChart({ attendanceData }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Destroy previous instance if exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      
      chartRef.current = new Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent'],
          datasets: [{
            data: [attendanceData.present, attendanceData.absent],
            backgroundColor: ['#4caf50', '#f44336'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = attendanceData.present + attendanceData.absent;
                  const value = context.raw;
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [attendanceData]);

  return <canvas ref={canvasRef} id="attendanceChart"></canvas>;
}

export default AttendanceChart;
