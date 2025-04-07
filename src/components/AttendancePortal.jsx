import React, { useState, useEffect, useRef } from "react";
//import { API_BASE_URL } from './apiConfig';

const AttendancePortal = () => {
  // Section states: "login", "department", "employee", "attendance"
  const [currentSection, setCurrentSection] = useState("login");
  const [clock, setClock] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [dept, setDept] = useState("");
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);
  const [responseMsg, setResponseMsg] = useState("");
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Refs for video, canvas and captured image
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const capturedImgRef = useRef(null);
  const videoStreamRef = useRef(null);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setClock(now.toLocaleDateString("en-US", options));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check login status on mount
  useEffect(() => {
    if (localStorage.getItem("loggedIn") === "true") {
      setCurrentSection("department");
    }
  }, []);

  // Login handler
  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      localStorage.setItem("loggedIn", "true");
      setLoginMsg("");
      setCurrentSection("department");
    } else {
      setLoginMsg("Invalid username or password.");
    }
  };

  // Show department selection
  const showDeptSelection = () => {
    setCurrentSection("department");
  };

  // Select a department and fetch employees
  const selectDept = (selectedDept) => {
    setDept(selectedDept);
    setCurrentSection("employee");
    fetchEmployeesByDepartment(selectedDept);
  };

  // Fetch employees from backend and filter by department
  const fetchEmployeesByDepartment = (dept) => {
    fetch("https://attendancebackend-ashen.vercel.app/get_employees")
      .then((response) => response.json())
      .then((data) => {
        const filtered = data.employees.filter(
          (emp) => emp.department.toLowerCase() === dept.toLowerCase()
        );
        setEmployees(filtered);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      });
  };

  // When an employee is selected, start attendance capture
  const selectEmployee = (emp) => {
    setCurrentEmployee(emp);
    setCurrentSection("attendance");
    setSuccessAnimation(false);
    // Reset captured image
    if (capturedImgRef.current) {
      capturedImgRef.current.style.display = "none";
    }
    startCamera();
  };

  // Start camera stream
  const startCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          videoStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          setResponseMsg(
            "Error accessing camera. Please ensure your camera is connected and you've granted permission."
          );
        });
    }
  };

  // Capture an image from the video stream
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add timestamp overlay
      const now = new Date();
      const timeStamp = now.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText(timeStamp, 10, canvas.height - 20);

      canvas.toBlob(
        (blob) => {
          setCapturedBlob(blob);
          if (capturedImgRef.current) {
            capturedImgRef.current.src = URL.createObjectURL(blob);
            capturedImgRef.current.style.display = "block";
          }
          const isLate =
            now.getHours() > 10 ||
            (now.getHours() === 10 && now.getMinutes() > 15);
          setTimeStatus({ isLate, timeStamp });
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Submit attendance data to API
  const submitAttendance = () => {
    if (!currentEmployee || !capturedBlob) {
      alert("Please capture your image first.");
      return;
    }
    const now = new Date();
    const fileName = `${currentEmployee.employee_name.replace(
      /\s/g,
      ""
    )}_${now.toISOString().replace(/[:.]/g, "-")}.jpg`;
    const formData = new FormData();
    formData.append("employee_id", currentEmployee.employee_id);
    formData.append("employee_name", currentEmployee.employee_name);
    formData.append("image", capturedBlob, fileName);

    setSubmitDisabled(true);

    fetch("https://attendancebackend-ashen.vercel.app/mark_attendance/", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (videoRef.current) videoRef.current.style.display = "none";
        setSuccessAnimation(true);
        setTimeout(() => {
          setCurrentSection("department");
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach((track) => track.stop());
          }
          setSubmitDisabled(false);
          setCapturedBlob(null);
          setTimeStatus(null);
          setResponseMsg("");
          setSuccessAnimation(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error submitting attendance:", error);
        setResponseMsg("Error submitting attendance. Please try again.");
        setSubmitDisabled(false);
      });
  };

  // Utility to get initials from a name
  const getInitials = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
        <div>{clock}</div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center p-4">
        {currentSection === "login" && (
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-center text-2xl font-bold mb-4">Admin Login</h2>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            {loginMsg && (
              <p className="text-red-500 text-center mb-2">{loginMsg}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-purple-700 text-white p-2 rounded flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          </div>
        )}

        {currentSection === "department" && (
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-center text-2xl font-bold mb-4">
              Select Your Department
            </h2>
            <p className="text-center mb-4">
              Please select your department to continue:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Tech",
                "Sales",
                "Execution",
                "Finance",
                "Design",
                "Media",
                "Miscellaneous",
              ].map((deptName) => (
                <div
                  key={deptName}
                  onClick={() => selectDept(deptName)}
                  className="bg-white rounded-lg shadow p-4 text-center cursor-pointer border border-transparent hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="text-4xl mb-2">
                    {deptName === "Tech" && (
                      <i className="fas fa-laptop-code text-purple-700"></i>
                    )}
                    {deptName === "Sales" && (
                      <i className="fas fa-chart-line text-purple-700"></i>
                    )}
                    {deptName === "Execution" && (
                      <i className="fas fa-tasks text-purple-700"></i>
                    )}
                    {deptName === "Finance" && (
                      <i className="fas fa-money-bill-wave text-purple-700"></i>
                    )}
                    {deptName === "Design" && (
                      <i className="fas fa-paint-brush text-purple-700"></i>
                    )}
                    {deptName === "Media" && (
                      <i className="fas fa-camera text-purple-700"></i>
                    )}
                    {deptName === "Miscellaneous" && (
                      <i className="fas fa-ellipsis-h text-purple-700"></i>
                    )}
                  </div>
                  <div className="font-semibold">{deptName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentSection === "employee" && (
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-center text-2xl font-bold mb-4">
              Select Your Name ({dept} Department)
            </h2>
            {employees.length === 0 ? (
              <p className="text-red-500 text-center">
                No employees are added in this department.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {employees.map((emp) => (
                  <div
                    key={emp.employee_id}
                    onClick={() => selectEmployee(emp)}
                    className="bg-white rounded-lg shadow p-4 text-center cursor-pointer border border-transparent hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center mb-2 text-2xl font-bold">
                      {getInitials(emp.employee_name)}
                    </div>
                    <div className="font-semibold">{emp.employee_name}</div>
                    <div className="text-sm text-gray-600">{emp.designation}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <button
                onClick={showDeptSelection}
                className="bg-gray-200 text-gray-700 p-2 rounded flex items-center gap-2"
              >
                <i className="fas fa-arrow-left"></i> Back to Departments
              </button>
            </div>
          </div>
        )}

        {currentSection === "attendance" && (
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <h2 className="text-center text-2xl font-bold mb-4">
              {currentEmployee
                ? `Hi ${currentEmployee.employee_name}, please mark your attendance`
                : "Mark Your Attendance"}
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-80 h-60 object-cover rounded-lg shadow"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition">
                  <button
                    onClick={captureImage}
                    className="bg-white bg-opacity-80 text-gray-700 rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <img
                ref={capturedImgRef}
                alt="Captured"
                className="w-80 h-60 rounded-lg shadow object-cover mb-4"
                style={{ display: "none" }}
              />
              {timeStatus && (
                <div className="mb-4">
                  {timeStatus.isLate ? (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                      Late ({timeStatus.timeStamp})
                    </div>
                  ) : (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      On Time ({timeStatus.timeStamp})
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={submitAttendance}
                disabled={submitDisabled}
                className="w-full bg-purple-700 text-white p-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitDisabled ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i> Submit Attendance
                  </>
                )}
              </button>
              {responseMsg && (
                <p className="mt-2 text-red-500">{responseMsg}</p>
              )}
              {successAnimation && (
                <div className="mt-4 text-center">
                  <svg
                    className="mx-auto mb-2"
                    width="80"
                    height="80"
                    viewBox="0 0 52 52"
                  >
                    <circle
                      className="text-green-500"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      className="text-green-500"
                      fill="none"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  {currentEmployee && timeStatus && (
                    <div>
                      {timeStatus.isLate ? (
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                          Marked as LOP (Time: {timeStatus.timeStamp})
                        </div>
                      ) : (
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          Attendance Recorded (Time: {timeStatus.timeStamp})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={showDeptSelection}
                  className="bg-gray-200 text-gray-700 p-2 rounded flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i> Cancel &amp; Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePortal;
