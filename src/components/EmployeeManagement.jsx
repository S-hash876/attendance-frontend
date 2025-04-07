// src/components/EmployeeManagement.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFileDownload,
  faSearch,
  faUserTimes,
  faIdCard,
  faCertificate,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function EmployeeManagement(props) {
  // Tabs and Employee List states
  const [activeTab, setActiveTab] = useState('add-employee');
  const [employeeList, setEmployeeList] = useState([]);

  // State for Edit Employee Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // States for "Add Employee" tab
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [doj, setDoj] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('Full Time');
  const [internshipDuration, setInternshipDuration] = useState('');
  const [basicPay, setBasicPay] = useState('');
  const [grossCTC, setGrossCTC] = useState('');
  const [netPay, setNetPay] = useState('');
  const [offerLetterPath, setOfferLetterPath] = useState('');

  // States for "Edit Employee" tab
  const [searchTerm, setSearchTerm] = useState('');

  // States for "Termination" tab
  const [terminateEmp, setTerminateEmp] = useState(null);
  const [terminationDate, setTerminationDate] = useState('');
  const [terminationReason, setTerminationReason] = useState('');
  const [collectiblesReturned, setCollectiblesReturned] = useState({
    accessCard: false,
    laptop: false,
    uniform: false,
    otherItems: false
  });

  // States for "ID Card" tab
  const [idCardEmp, setIdCardEmp] = useState(null);
  const [empPhoto, setEmpPhoto] = useState(null);

  // Helper: Toggle internship field (shows when Intern is selected)
  const handleEmploymentTypeChange = (e) => {
    setEmploymentType(e.target.value);
    if (e.target.value !== 'Intern') {
      setInternshipDuration('');
    }
  };

  // -------------------- Add Employee Tab --------------------
  const submitAddEmployee = () => {
    const employee = {
      employee_id: empId,
      employee_name: empName,
      date_of_joining: doj,
      designation: designation,
      department: department,
      employment_type: employmentType,
      internship_duration: employmentType === 'Intern' ? internshipDuration : '',
      basic_pay: parseFloat(basicPay),
      gross_ctc: parseFloat(grossCTC),
      net_pay: parseFloat(netPay)
    };

    fetch(`${API_BASE_URL}/add_employee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employee)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Employee added successfully.');
          setOfferLetterPath(data.offer_letter_path);
          // Clear form fields
          setEmpId('');
          setEmpName('');
          setDoj('');
          setDesignation('');
          setDepartment('');
          setEmploymentType('Full Time');
          setInternshipDuration('');
          setBasicPay('');
          setGrossCTC('');
          setNetPay('');
          // Refresh employee list
          fetchEmployees();
        } else {
          alert(data.error || 'Error adding employee.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error adding employee.');
      });
  };

   // New state for document preview modal
   const [docPreviewUrl, setDocPreviewUrl] = useState('');
   const [showDocPreview, setShowDocPreview] = useState(false);
   const [docType, setDocType] = useState(''); // e.g., "offer", "termination", etc.

   
  // Modify downloadOfferLetter to open preview modal instead of direct download.
  const downloadOfferLetter = () => {
    if (!currentEmployee) {
      alert('Please add an employee first');
      return;
    }
    // Call your backend endpoint to generate (or retrieve) the offer letter preview URL.
    fetch(`${API_BASE_URL}/preview_offer_letter/${currentEmployee.employee_id}`)
      .then(response => response.json())
      .then(data => {
        if (data.preview_url) {
          setDocPreviewUrl(data.preview_url);
          setDocType('offer');
          setShowDocPreview(true);
        } else {
          alert('Preview not available.');
        }
      })
      .catch(error => {
        console.error('Error generating preview:', error);
      });
  };

  // Example function for when the admin clicks "Edit via Canva"
  const editDocument = () => {
    // Open a Canva Connect editor embedded in a modal, or redirect to Canva editor.
    // For example, you might set window.location.href to the Canva Connect URL.
    window.open('https://www.canva.dev/docs/connect/', '_blank');
  };

  // Render document preview modal
  const renderDocPreviewModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2">
        <h3 className="text-lg font-semibold mb-4">Document Preview ({docType} letter)</h3>
        <iframe
          src={docPreviewUrl}
          className="w-full h-96 border rounded mb-4"
          title="Document Preview"
        ></iframe>
        <div className="flex justify-end gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={editDocument}
          >
            Edit via Canva
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
              // Trigger final save/download action here
              window.open(docPreviewUrl, '_blank');
              setShowDocPreview(false);
            }}
          >
            Save &amp; Download
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => setShowDocPreview(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // -------------------- Edit Employee Tab --------------------
  const fetchEmployees = () => {
    fetch(`${API_BASE_URL}/get_employees`)
      .then(response => response.json())
      .then(data => {
        setEmployeeList(data.employees);
      })
      .catch(error => console.error('Error fetching employees:', error));
  };

  useEffect(() => {
    // Load employee list on mount for editing, termination, and ID card tabs
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (props.editEmployee) {
      openEditModal(props.editEmployee);
    }
  }, [props.editEmployee]);
  

  const searchEmployees = () => {
    fetch(`${API_BASE_URL}/get_employees`)
      .then(response => response.json())
      .then(data => {
        const filtered = data.employees.filter(emp =>
          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setEmployeeList(filtered);
      })
      .catch(error => console.error('Error searching employees:', error));
  };

  // -------------------- Termination Tab --------------------
  const submitTermination = () => {
    if (!terminateEmp || !terminationDate || !terminationReason) {
      alert('Please complete all termination fields.');
      return;
    }
    const terminationData = {
      employee_id: terminateEmp.employee_id,
      termination_date: terminationDate,
      termination_reason: terminationReason,
      collectibles_returned: collectiblesReturned.accessCard &&
                              collectiblesReturned.laptop &&
                              collectiblesReturned.uniform &&
                              collectiblesReturned.otherItems
    };

    fetch(`${API_BASE_URL}/terminate_employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(terminationData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Employee terminated successfully.');
          fetchEmployees();
        } else {
          alert(data.error || 'Error terminating employee.');
        }
      })
      .catch(error => {
        console.error('Termination error:', error);
        alert('Error terminating employee.');
      });
  };

  // -------------------- ID Card Tab --------------------
  const generateIDCard = () => {
    if (!idCardEmp) {
      alert('Please select an employee for ID Card generation.');
      return;
    }
    window.open(`${API_BASE_URL}/generate_employee_id_card/${idCardEmp.employee_id}`, '_blank');
  };

  // -------------------- Edit Modal Functionality --------------------
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
    // Optionally switch to the "Edit Employee" tab:
    setActiveTab('edit-employee');
  };

  const handleUpdateEmployee = () => {
    fetch(`${API_BASE_URL}/edit_employee`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedEmployee)
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Employee updated successfully.');
          fetchEmployees();
          setIsEditModalOpen(false);
        } else {
          alert(data.error || 'Error updating employee.');
        }
      })
      .catch(error => {
        console.error('Error updating employee:', error);
        alert('Error updating employee.');
      });
  };

  // -------------------- Render Functions for Tabs --------------------
  const renderAddEmployeeTab = () => (
    <div id="tab-add-employee">
      <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Add New Employee</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div className="form-group">
            <label htmlFor="empId" className="block font-medium mb-1">Employee ID</label>
            <input type="text" id="empId" value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="EMP-XXX" className="w-full border rounded px-2 py-1" />
          </div>
          {/* Employee Name */}
          <div className="form-group">
            <label htmlFor="empName" className="block font-medium mb-1">Employee Name</label>
            <input type="text" id="empName" value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="Full Name" className="w-full border rounded px-2 py-1" />
          </div>
          {/* Date of Joining */}
          <div className="form-group">
            <label htmlFor="doj" className="block font-medium mb-1">Date of Joining</label>
            <input type="date" id="doj" value={doj} onChange={(e) => setDoj(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          {/* Designation */}
          <div className="form-group">
            <label htmlFor="designation" className="block font-medium mb-1">Designation</label>
            <input type="text" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Job Title" className="w-full border rounded px-2 py-1" />
          </div>
          {/* Department */}
          <div className="form-group">
            <label htmlFor="department" className="block font-medium mb-1">Department</label>
            <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="" disabled>Select Department</option>
              <option value="Tech">Tech</option>
              <option value="Sales">Sales</option>
              <option value="Execution">Execution</option>
              <option value="Finance">Finance</option>
              <option value="Design">Design</option>
              <option value="Media">Media</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          {/* Employment Type */}
          <div className="form-group">
            <label htmlFor="employmentType" className="block font-medium mb-1">Employment Type</label>
            <select id="employmentType" value={employmentType} onChange={handleEmploymentTypeChange} className="w-full border rounded px-2 py-1">
              <option value="Full Time">Full Time</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
          {/* Internship Duration (only if Intern is selected) */}
          {employmentType === 'Intern' && (
            <div className="form-group">
              <label htmlFor="internshipDuration" className="block font-medium mb-1">Internship Duration</label>
              <input type="text" id="internshipDuration" value={internshipDuration} onChange={(e) => setInternshipDuration(e.target.value)} placeholder="e.g., 3 months" className="w-full border rounded px-2 py-1" />
            </div>
          )}
          {/* Basic Pay */}
          <div className="form-group">
            <label htmlFor="basicPay" className="block font-medium mb-1">Basic Pay</label>
            <input type="number" id="basicPay" value={basicPay} onChange={(e) => setBasicPay(e.target.value)} placeholder="Enter amount" className="w-full border rounded px-2 py-1" />
          </div>
          {/* Gross CTC */}
          <div className="form-group">
            <label htmlFor="grossCTC" className="block font-medium mb-1">Gross CTC</label>
            <input type="number" id="grossCTC" value={grossCTC} onChange={(e) => setGrossCTC(e.target.value)} placeholder="Enter amount" className="w-full border rounded px-2 py-1" />
          </div>
          {/* Net Pay */}
          <div className="form-group">
            <label htmlFor="netPay" className="block font-medium mb-1">Net Pay</label>
            <input type="number" id="netPay" value={netPay} onChange={(e) => setNetPay(e.target.value)} placeholder="Enter amount" className="w-full border rounded px-2 py-1" />
          </div>
        </div>
        <div className="border-t p-4 flex justify-end gap-2">
          <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800" onClick={submitAddEmployee}>
            <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Employee
          </button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" disabled onClick={downloadOfferLetter} id="offerLetterBtn">
            <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Download Offer Letter
          </button>
        </div>
      </div>
    </div>
  );

  const renderEditEmployeeTab = () => (
    <div id="tab-edit-employee" className="tab-content">
      <div className="border rounded shadow bg-white mb-4">
        <div className="border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Employee Details</h3>
          <div className="flex items-center">
            <input
              type="text"
              id="searchEmployee"
              placeholder="Search by name or ID"
              className="w-auto border rounded px-2 py-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-gray-300 text-gray-700 ml-2 px-3 py-1 rounded" onClick={searchEmployees}>
              <FontAwesomeIcon icon={faSearch} className="mr-1" /> Search
            </button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">DOJ</th>
                <th className="p-2 text-left">Designation</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody id="employeeListBody">
              {employeeList.length > 0 ? (
                employeeList.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-gray-50">
                    <td className="p-2">{emp.employee_id}</td>
                    <td className="p-2">{emp.employee_name}</td>
                    <td className="p-2">{emp.date_of_joining}</td>
                    <td className="p-2">{emp.designation}</td>
                    <td className="p-2">{emp.department}</td>
                    <td className="p-2">{emp.employment_type}</td>
                    <td className="p-2 space-x-2">
                      <button 
                        className="text-blue-600"
                        onClick={() => openEditModal(emp)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="text-red-600" onClick={() => {
                        if (window.confirm("Are you sure you want to delete this employee?")) {
                          // Delete employee
                          fetch(`${API_BASE_URL}/delete_employee/${emp.employee_id}`, {
                            method: 'DELETE'
                          })
                            .then(response => response.json())
                            .then(data => {
                              if (data.message) {
                                alert('Employee deleted successfully!');
                                fetchEmployees();
                              } else {
                                alert(data.error || 'Error deleting employee.');
                              }
                            })
                            .catch(error => {
                              console.error('Error deleting employee:', error);
                              alert('Error deleting employee.');
                            });
                        }
                      }}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan="7">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTerminationTab = () => (
    <div id="tab-termination" className="tab-content">
      <div className="border rounded shadow bg-white mb-4">
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold">Employee Termination</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="terminateEmp" className="block font-medium mb-1">Select Employee</label>
            <select
              id="terminateEmp"
              className="w-full border rounded px-2 py-1"
              onChange={(e) => {
                const selected = JSON.parse(e.target.value);
                setTerminateEmp(selected);
              }}
            >
              <option value="" disabled selected>Select Employee</option>
              {employeeList.map(emp => (
                <option key={emp.employee_id} value={JSON.stringify(emp)}>
                  {emp.employee_id} - {emp.employee_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="terminationDate" className="block font-medium mb-1">Termination Date</label>
            <input type="date" id="terminationDate" className="w-full border rounded px-2 py-1" value={terminationDate} onChange={(e)=> setTerminationDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="terminationReason" className="block font-medium mb-1">Termination Reason</label>
            <textarea
              id="terminationReason"
              rows="3"
              placeholder="Enter reason for termination"
              className="w-full border rounded px-2 py-1"
              value={terminationReason}
              onChange={(e)=> setTerminationReason(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Collectibles Return Status</label>
            <div>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  id="accessCardReturned"
                  checked={collectiblesReturned.accessCard}
                  onChange={(e) => setCollectiblesReturned({...collectiblesReturned, accessCard: e.target.checked})}
                /> Access Card
              </label>
              <label className="checkbox-inline" style={{ marginLeft: '15px' }}>
                <input
                  type="checkbox"
                  id="laptopReturned"
                  checked={collectiblesReturned.laptop}
                  onChange={(e) => setCollectiblesReturned({...collectiblesReturned, laptop: e.target.checked})}
                /> Laptop
              </label>
              <label className="checkbox-inline" style={{ marginLeft: '15px' }}>
                <input
                  type="checkbox"
                  id="uniformReturned"
                  checked={collectiblesReturned.uniform}
                  onChange={(e) => setCollectiblesReturned({...collectiblesReturned, uniform: e.target.checked})}
                /> Uniform
              </label>
              <label className="checkbox-inline" style={{ marginLeft: '15px' }}>
                <input
                  type="checkbox"
                  id="otherItemsReturned"
                  checked={collectiblesReturned.otherItems}
                  onChange={(e) => setCollectiblesReturned({...collectiblesReturned, otherItems: e.target.checked})}
                /> Other Items
              </label>
            </div>
          </div>
        </div>
        <div className="card-footer p-4 flex flex-col md:flex-row justify-end gap-2">
          <div className="flex justify-end gap-2 mt-4 md:mt-0">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={submitTermination}>
              <FontAwesomeIcon icon={faUserTimes} className="mr-1" /> Terminate Employee
            </button>
            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => { /* Implement download termination letter logic if needed */ }}>
              <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Download Termination Letter
            </button>
            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => { /* Implement generate certificate logic if needed */ }}>
              <FontAwesomeIcon icon={faCertificate} className="mr-1" /> Generate Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIDCardTab = () => (
    <div id="tab-id-card" className="tab-content">
      <div className="border rounded shadow bg-white mb-4">
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold">Employee ID Card Generator</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="idCardEmp" className="block font-medium mb-1">Select Employee</label>
            <select
              id="idCardEmp"
              className="w-full border rounded px-2 py-1"
              onChange={(e) => {
                const selected = JSON.parse(e.target.value);
                setIdCardEmp(selected);
              }}
            >
              <option value="" disabled selected>Select Employee</option>
              {employeeList.map(emp => (
                <option key={emp.employee_id} value={JSON.stringify(emp)}>
                  {emp.employee_id} - {emp.employee_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="empPhoto" className="block font-medium mb-1">Upload Photo</label>
            <input
              type="file"
              id="empPhoto"
              accept="image/*"
              className="w-full border rounded px-2 py-1"
              onChange={(e) => setEmpPhoto(e.target.files[0])}
            />
          </div>
        </div>
        <div className="mt-4">
          <div id="idCardPreview" className="w-80 h-48 border border-gray-300 m-5 p-2 rounded relative">
            <div className="text-center font-bold mb-4">XPLOR RIDES PVT LTD</div>
            <div className="flex">
              <div className="w-24 h-32 bg-gray-200 border border-dashed border-gray-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
              </div>
              <div className="ml-4">
                <p><strong>ID:</strong> <span id="previewEmpId">-</span></p>
                <p><strong>Name:</strong> <span id="previewEmpName">-</span></p>
                <p><strong>Designation:</strong> <span id="previewDesignation">-</span></p>
                <p><strong>Department:</strong> <span id="previewDepartment">-</span></p>
                <p><strong>DOJ:</strong> <span id="previewDOJ">-</span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t p-4 flex justify-end">
          <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800" onClick={generateIDCard}>
            <FontAwesomeIcon icon={faIdCard} className="mr-1" /> Generate ID Card
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Employee Management</h2>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button onClick={() => setActiveTab('add-employee')}
          className={`px-4 py-2 font-medium ${activeTab === 'add-employee' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-600'}`}>
          Add Employee
        </button>
        <button onClick={() => setActiveTab('edit-employee')}
          className={`px-4 py-2 font-medium ${activeTab === 'edit-employee' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-600'}`}>
          Edit Employee
        </button>
        <button onClick={() => setActiveTab('termination')}
          className={`px-4 py-2 font-medium ${activeTab === 'termination' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-600'}`}>
          Termination
        </button>
        <button onClick={() => setActiveTab('id-card')}
          className={`px-4 py-2 font-medium ${activeTab === 'id-card' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-600'}`}>
          ID Card
        </button>
        </div>
          {activeTab === 'edit-employee' && (
            <div>
              {/* Render Edit Employee form */}
            </div>
             )}

      {/* Tab Contents */}
      {activeTab === 'add-employee' && renderAddEmployeeTab()}
      {activeTab === 'edit-employee' && renderEditEmployeeTab()}
      {activeTab === 'termination' && renderTerminationTab()}
      {activeTab === 'id-card' && renderIDCardTab()}

      {/* Edit Employee Modal */}
      {isEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg border p-6 w-11/12 md:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Employee</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded">
                Close
              </button>
            </div>
            <div className="mb-4">
              <div className="form-group">
                <label className="block font-medium mb-1">Employee ID</label>
                <input type="text" value={selectedEmployee.employee_id} readOnly className="w-full border rounded px-2 py-1" />
              </div>
              <div className="form-group">
                <label className="block font-medium mb-1">Employee Name</label>
                <input
                  type="text"
                  name="employee_name"
                  value={selectedEmployee.employee_name}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, employee_name: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="form-group">
                <label className="block font-medium mb-1">Date of Joining</label>
                <input
                  type="date"
                  name="date_of_joining"
                  value={selectedEmployee.date_of_joining}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, date_of_joining: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="form-group">
                <label className="block font-medium mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={selectedEmployee.designation}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="form-group">
                <label className="block font-medium mb-1">Department</label>
                <select
                  name="department"
                  value={selectedEmployee.department}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, department: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="Tech">Tech</option>
                  <option value="Sales">Sales</option>
                  <option value="Execution">Execution</option>
                  <option value="Finance">Finance</option>
                  <option value="Design">Design</option>
                  <option value="Media">Media</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="form-group">
                <label className="block font-medium mb-1">Employment Type</label>
                <select
                  name="employment_type"
                  value={selectedEmployee.employment_type}
                  onChange={(e) =>
                    setSelectedEmployee({ ...selectedEmployee, employment_type: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              {selectedEmployee.employment_type === 'Intern' && (
                <div className="form-group">
                  <label className="block font-medium mb-1">Internship Duration</label>
                  <input
                    type="text"
                    name="internship_duration"
                    value={selectedEmployee.internship_duration || ''}
                    onChange={(e) =>
                      setSelectedEmployee({ ...selectedEmployee, internship_duration: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              )}
              {/* Add other fields as needed */}
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800" onClick={handleUpdateEmployee}>
                Save Changes
              </button>
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Document Preview Modal */}
      {showDocPreview && renderDocPreviewModal()}
    </div>
  );
}

export default EmployeeManagement;
