import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faCalculator, faSave, faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../apiConfig';

function PayrollManagement() {
  const [activeTab, setActiveTab] = useState('payroll-entry');
  const [employees, setEmployees] = useState([]);
  const [dynamicEntries, setDynamicEntries] = useState({
    allowances: [],
    deductions: [],
    reimbursements: []
  });

  // Fetch employees from the backend using the get_employees endpoint
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/get_employees`);
        const data = await res.json();
        if (data.employees) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const addDynamicEntry = (type) => {
    const newEntry = { name: '', amount: '', date: new Date().toISOString().split('T')[0] };
    setDynamicEntries((prev) => ({ ...prev, [type]: [...prev[type], newEntry] }));
  };

  const removeDynamicEntry = (type, index) => {
    setDynamicEntries((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleDynamicChange = (type, index, field, value) => {
    setDynamicEntries((prev) => {
      const updated = [...prev[type]];
      updated[index][field] = value;
      return { ...prev, [type]: updated };
    });
  };

  // Auto-fill payroll from attendance using the API endpoint
  const autoFillPayroll = async () => {
    const empSelect = document.getElementById('payrollEmp');
    const monthEntry = document.getElementById('payrollMonthEntry').value;
    if (!empSelect.value || !monthEntry) {
      alert('Please select an employee and month');
      return;
    }
    const empData = JSON.parse(empSelect.value);

    try {
      const res = await fetch(`${API_BASE_URL}/auto_payroll?month=${monthEntry}`);
      const data = await res.json();
      // Assume data.entries is an array of payroll entries
      const entry = data.entries.find(item => item.employee_id === empData.employee_id);
      if (entry) {
        document.getElementById('totalWorkingDays').value = entry.total_working_days;
        document.getElementById('wfh').value = entry.wfh;
        document.getElementById('leave').value = entry.leave;
        document.getElementById('lop').value = entry.lop;
        document.getElementById('gross').value = entry.gross_ctc;
        document.getElementById('basic').value = entry.basic_pay;
        document.getElementById('allowance').value = entry.total_allowance;
        document.getElementById('tax').value = entry.total_deductions;
        document.getElementById('reimbursements').value = entry.total_reimbursements;
        document.getElementById('net').value = entry.net_pay;
      } else {
        alert('No payroll data found for this employee');
      }
    } catch (error) {
      console.error('Error in autoFillPayroll:', error);
    }
  };

  // This function can be expanded to load employee-specific pay details if needed
  const loadEmployeePayDetails = () => {
    console.log('Load Employee Pay Details called');
  };

  const calculateNetPay = () => {
    const gross = parseFloat(document.getElementById('gross').value) || 0;
    const totalAllowances = dynamicEntries.allowances.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalDeductions = dynamicEntries.deductions.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalReimbursements = dynamicEntries.reimbursements.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const net = gross + totalAllowances - totalDeductions + totalReimbursements;
    
    // Update the input fields with the calculated values
    document.getElementById('allowance').value = totalAllowances.toFixed(2);
    document.getElementById('tax').value = totalDeductions.toFixed(2);
    document.getElementById('reimbursements').value = totalReimbursements.toFixed(2);
    document.getElementById('net').value = net.toFixed(2);
  };
  

  // Submit payroll data to the API
  const submitPayroll = async () => {
    const empSelect = document.getElementById('payrollEmp');
    const monthEntry = document.getElementById('payrollMonthEntry').value;
    if (!empSelect.value || !monthEntry) {
      alert('Please select an employee and month');
      return;
    }
    const empData = JSON.parse(empSelect.value);
    const payload = {
      month: monthEntry,
      employee_id: empData.employee_id,
      employee_name: empData.employee_name,
      date_of_joining: empData.date_of_joining,
      designation: empData.designation,
      department: empData.department,
      total_working_days: parseInt(document.getElementById('totalWorkingDays').value) || 0,
      wfh: parseInt(document.getElementById('wfh').value) || 0,
      leave: parseInt(document.getElementById('leave').value) || 0,
      lop: parseInt(document.getElementById('lop').value) || 0,
      gross_ctc: parseFloat(document.getElementById('gross').value) || 0,
      basic_pay: parseFloat(document.getElementById('basic').value) || 0,
      // Remove or update these if you're computing totals on the backend:
      total_allowance: parseFloat(document.getElementById('allowance').value) || 0,
      total_deductions: parseFloat(document.getElementById('deductions').value) || 0,
      total_reimbursements: parseFloat(document.getElementById('reimbursements').value) || 0,
      net_pay: parseFloat(document.getElementById('net').value) || 0,
      payment_mode: document.getElementById('mode').value,
      payment_status: document.getElementById('status').value,
      // Include the detailed dynamic entries:
      allowance_items: dynamicEntries.allowances,
      deduction_items: dynamicEntries.deductions,
      reimbursement_items: dynamicEntries.reimbursements,
    };
    

    try {
      const res = await fetch(`${API_BASE_URL}/submit_payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message) {
        alert('Payroll submitted successfully!');
        // Optionally clear or reset form fields here
      } else {
        alert(data.error || 'Error submitting payroll');
      }
    } catch (error) {
      console.error('Error in submitPayroll:', error);
      alert('Error submitting payroll');
    }
  };

  // Download payroll Excel file
  const downloadPayroll = () => {
    const month = document.getElementById('payrollMonthDownload').value;
    if (!month) {
      alert('Please select a month');
      return;
    }
    window.open(`${API_BASE_URL}/export_payroll_excel?month=${month}`, '_blank');
  };

  // Download individual payslip (PDF)
  const downloadPayrollSlip = () => {
    const empSelect = document.getElementById('payslipEmp');
    const month = document.getElementById('payslipMonth').value;
    if (!empSelect.value || !month) {
      alert('Please select an employee and month');
      return;
    }
    const empData = JSON.parse(empSelect.value);
    window.open(`${API_BASE_URL}/download_payroll_slip/${empData.employee_id}/${month}`, '_blank');
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Payroll Management</h2>
      <div className="mb-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('payroll-entry')}
            className={`py-2 px-4 font-medium transition border-b-2 ${
              activeTab === 'payroll-entry'
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-gray-600'
            }`}
          >
            Payroll Entry
          </button>
          <button
            onClick={() => setActiveTab('payroll-download')}
            className={`py-2 px-4 font-medium transition border-b-2 ${
              activeTab === 'payroll-download'
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-gray-600'
            }`}
          >
            Download Payroll
          </button>
        </div>

        {/* Payroll Entry Tab */}
        {activeTab === 'payroll-entry' && (
          <>
            <div id="tab-payroll-entry">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Create Payroll Entry</h3>
                  <button
                    className="flex items-center bg-gray-500 text-white text-sm px-3 py-1 rounded hover:bg-gray-600"
                    onClick={autoFillPayroll}
                  >
                    <FontAwesomeIcon icon={faMagic} className="mr-2" />
                    Auto-Fill from Attendance
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select Employee */}
                    <div className="form-group">
                      <label htmlFor="payrollEmp" className="block mb-1 font-medium">
                        Select Employee
                      </label>
                      <select
                        id="payrollEmp"
                        className="w-full border rounded px-2 py-1"
                        onChange={loadEmployeePayDetails}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select Employee
                        </option>
                        {employees.map((emp) => (
                          <option
                            key={emp.employee_id}
                            value={JSON.stringify(emp)}
                          >
                            {emp.employee_name} ({emp.employee_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Select Month */}
                    <div className="form-group">
                      <label htmlFor="payrollMonthEntry" className="block mb-1 font-medium">
                        Select Month
                      </label>
                      <input
                        type="month"
                        id="payrollMonthEntry"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Total Working Days */}
                    <div className="form-group">
                      <label htmlFor="totalWorkingDays" className="block mb-1 font-medium">
                        Total Working Days
                      </label>
                      <input
                        type="number"
                        id="totalWorkingDays"
                        className="w-full border rounded px-2 py-1"
                        readOnly
                      />
                    </div>
                    {/* WFH Days */}
                    <div className="form-group">
                      <label htmlFor="wfh" className="block mb-1 font-medium">
                        WFH Days
                      </label>
                      <input
                        type="number"
                        id="wfh"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Leave Days */}
                    <div className="form-group">
                      <label htmlFor="leave" className="block mb-1 font-medium">
                        Leave Days
                      </label>
                      <input
                        type="number"
                        id="leave"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* LOP Days */}
                    <div className="form-group">
                      <label htmlFor="lop" className="block mb-1 font-medium">
                        LOP Days
                      </label>
                      <input
                        type="number"
                        id="lop"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Gross CTC */}
                    <div className="form-group">
                      <label htmlFor="gross" className="block mb-1 font-medium">
                        Gross CTC
                      </label>
                      <input
                        type="number"
                        id="gross"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Basic Pay */}
                    <div className="form-group">
                      <label htmlFor="basic" className="block mb-1 font-medium">
                        Basic Pay
                      </label>
                      <input
                        type="number"
                        id="basic"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Total Allowance */}
                    <div className="form-group">
                      <label htmlFor="allowance" className="block mb-1 font-medium">
                        Total Allowance
                      </label>
                      <input
                        type="number"
                        id="allowance"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Total Deductions */}
                    <div className="form-group">
                      <label htmlFor="tax" className="block mb-1 font-medium">
                        Total Deductions
                      </label>
                      <input
                        type="number"
                        id="tax"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                  
                    {/* Total Reimbursements */}
                    <div className="form-group">
                      <label htmlFor="reimbursements" className="block mb-1 font-medium">
                        Total Reimbursements
                      </label>
                      <input
                        type="number"
                        id="reimbursements"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Net Pay */}
                    <div className="form-group">
                      <label htmlFor="net" className="block mb-1 font-medium">
                        Net Pay
                      </label>
                      <input
                        type="number"
                        id="net"
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {/* Payment Mode */}
                    <div className="form-group">
                      <label htmlFor="mode" className="block mb-1 font-medium">
                        Payment Mode
                      </label>
                      <select id="mode" className="w-full border rounded px-2 py-1">
                        <option value="">Select Mode</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    {/* Payment Status */}
                    <div className="form-group">
                      <label htmlFor="status" className="block mb-1 font-medium">
                        Payment Status
                      </label>
                      <select id="status" className="w-full border rounded px-2 py-1">
                        <option value="">Select Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                    onClick={calculateNetPay}
                  >
                    <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                    Calculate Net Pay
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                    onClick={submitPayroll}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Submit Payroll
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Employee */}
              <div className="form-group">
                <label htmlFor="payrollEmp" className="block mb-1 font-medium">
                    Select Employee
                </label>
                <select
                   id="payrollEmp"
                   className="w-full border rounded px-2 py-1"
                   onChange={loadEmployeePayDetails}
                   defaultValue=""
                >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((emp) => (
                <option
                  key={emp.employee_id}
                  value={JSON.stringify(emp)}
                >
                  {emp.employee_name} ({emp.employee_id})
                </option>
                ))}
               </select>
              </div>
              </div> 

              {/* Add vertical spacing between the sections */}
              <div className="my-6"></div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {['allowances', 'deductions', 'reimbursements'].map((type) => (
          <div key={type} className="border rounded p-4 bg-white">
            <h4 className="font-semibold capitalize mb-2">{type}</h4>
            <div className="text-sm text-gray-600 mb-2">
              Total: ₹{dynamicEntries[type].reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}
            </div>
            {dynamicEntries[type].map((entry, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type"
                  value={entry.name}
                  onChange={(e) => handleDynamicChange(type, index, 'name', e.target.value)}
                  className="border px-2 py-1 rounded flex-1"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={entry.amount}
                  onChange={(e) => handleDynamicChange(type, index, 'amount', e.target.value)}
                  className="border px-2 py-1 rounded w-24"
                />
                <span className="text-xs text-gray-500">{entry.date}</span>
                <button onClick={() => removeDynamicEntry(type, index)} className="text-red-500 text-sm">✕</button>
              </div>
            ))}
            <button onClick={() => addDynamicEntry(type)} className="text-blue-600 text-sm underline">
              + Add {type.slice(0, -1)}
            </button>
          </div>
        ))}
      </div>
            </div>
          </>
        )}

        {/* Payroll Download Tab */}
        {activeTab === 'payroll-download' && (
          <div id="tab-payroll-download">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Download Payroll Data</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="payrollMonthDownload" className="block mb-1 font-medium">
                      Select Month
                    </label>
                    <input
                      type="month"
                      id="payrollMonthDownload"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="form-group flex items-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                      onClick={downloadPayroll}
                    >
                      <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                      Download Payroll Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Download Individual Payslip</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="payslipEmp" className="block mb-1 font-medium">
                      Select Employee
                    </label>
                    <select id="payslipEmp" className="w-full border rounded px-2 py-1" defaultValue="">
                      <option value="" disabled>
                        Select Employee
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.employee_id} value={JSON.stringify(emp)}>
                          {emp.employee_name} ({emp.employee_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="payslipMonth" className="block mb-1 font-medium">
                      Select Month
                    </label>
                    <input
                      type="month"
                      id="payslipMonth"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="form-group flex items-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                      onClick={downloadPayrollSlip}
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                      Download Payslip (PDF)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PayrollManagement;
