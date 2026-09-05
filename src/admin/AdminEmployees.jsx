import React, { useState, useEffect } from "react";
import "./admin-styles.css";

export function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // All Attendance & Leaves for Advanced Filter & Reporting
  const [allAttendance, setAllAttendance] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);

  // Attendance map: { [empId]: todayAttendanceRecord }
  const [todayAttendanceMap, setTodayAttendanceMap] = useState({});
  const [punchLoadingEmpId, setPunchLoadingEmpId] = useState(null);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "Frontend Developer",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "Pending",
  });
  const [addLoading, setAddLoading] = useState(false);

  // Confirm / Create Credentials Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetEmp, setTargetEmp] = useState(null);
  const [credForm, setCredForm] = useState({
    email: "",
    password: "",
    showPassword: true,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ── INLINE ACCORDION DROPDOWN (No popup modal!) ──
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [empActivityMap, setEmpActivityMap] = useState({}); // { [empId]: { attendance: [], workReports: [], leaves: [], loading: false } }
  const [expandedTabMap, setExpandedTabMap] = useState({}); // { [empId]: "attendance" | "leaves" | "work" }

  // ── ADVANCED CALENDAR FILTER SLIDE-OVER DRAWER ──
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [advFilter, setAdvFilter] = useState({
    empId: "All",
    department: "All",
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    category: "All", // "All" | "PunchIn" | "Leaves"
  });

  // Toast message
  const [toast, setToast] = useState("");

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const [empRes, attRes, lvRes] = await Promise.all([
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/attendance", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data);
      }

      if (attRes.ok) {
        const attList = await attRes.json();
        setAllAttendance(attList);
        const todayStr = new Date().toISOString().split("T")[0];
        const map = {};
        attList.forEach((a) => {
          if (a.date === todayStr) {
            map[a.employeeId] = a;
          }
        });
        setTodayAttendanceMap(map);
      }

      if (lvRes.ok) {
        setAllLeaves(await lvRes.json());
      }
    } catch (err) {
      console.error("Error fetching employees/attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Punch In handler
  const handlePunchIn = async (emp) => {
    setPunchLoadingEmpId(emp.empId);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/attendance/clockin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: emp.empId,
          employeeName: emp.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodayAttendanceMap((prev) => ({ ...prev, [emp.empId]: data }));
        setAllAttendance((prev) => [data, ...prev.filter((a) => !(a.employeeId === emp.empId && a.date === data.date))]);
        showToastMsg(`🟢 Punched In ${emp.name} at ${data.clockIn}! Status: ${data.status}`);
      } else {
        alert(data.message || "Failed to punch in");
      }
    } catch (err) {
      alert("Error punching in");
    } finally {
      setPunchLoadingEmpId(null);
    }
  };

  // Punch Out handler
  const handlePunchOut = async (emp) => {
    setPunchLoadingEmpId(emp.empId);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/attendance/clockout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: emp.empId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodayAttendanceMap((prev) => ({ ...prev, [emp.empId]: data }));
        setAllAttendance((prev) => prev.map((a) => (a.employeeId === emp.empId && a.date === data.date ? data : a)));
        showToastMsg(`🛑 Punched Out ${emp.name} at ${data.clockOut}. Total: ${data.totalHours}`);
      } else {
        alert(data.message || "Failed to punch out");
      }
    } catch (err) {
      alert("Error punching out");
    } finally {
      setPunchLoadingEmpId(null);
    }
  };

  // Toggle Inline Accordion Dropdown (No Popup Modal!)
  const toggleEmployeeDetails = async (emp) => {
    if (expandedEmpId === emp.empId) {
      setExpandedEmpId(null);
      return;
    }

    setExpandedEmpId(emp.empId);
    if (!expandedTabMap[emp.empId]) {
      setExpandedTabMap((prev) => ({ ...prev, [emp.empId]: "attendance" }));
    }

    // Check if already loaded
    if (empActivityMap[emp.empId]?.attendance) {
      return;
    }

    setEmpActivityMap((prev) => ({
      ...prev,
      [emp.empId]: { attendance: [], workReports: [], leaves: [], loading: true },
    }));

    const token = localStorage.getItem("nex_admin_token");
    try {
      const [attRes, wrRes, lvRes] = await Promise.all([
        fetch(`/api/attendance?empId=${emp.empId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/work-reports?empId=${emp.empId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/leaves?empId=${emp.empId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const attendance = attRes.ok ? await attRes.json() : [];
      const workReports = wrRes.ok ? await wrRes.json() : [];
      const leaves = lvRes.ok ? await lvRes.json() : [];

      setEmpActivityMap((prev) => ({
        ...prev,
        [emp.empId]: { attendance, workReports, leaves, loading: false },
      }));
    } catch (err) {
      console.error("Error loading activity details:", err);
      setEmpActivityMap((prev) => ({
        ...prev,
        [emp.empId]: { attendance: [], workReports: [], leaves: [], loading: false },
      }));
    }
  };

  // Add New Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return;

    setAddLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (res.ok) {
        const created = await res.json();
        setEmployees([created, ...employees]);
        setShowAddModal(false);
        setNewEmployee({
          name: "",
          email: "",
          phone: "",
          department: "Engineering",
          designation: "Frontend Developer",
          joiningDate: new Date().toISOString().split("T")[0],
          status: "Pending",
        });
        showToastMsg(`✅ Added employee ${created.name} (${created.empId}) as Pending.`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add employee");
      }
    } catch (err) {
      alert("Error adding employee");
    } finally {
      setAddLoading(false);
    }
  };

  // Open Confirm / Credentials Modal
  const openConfirmModal = (emp) => {
    setTargetEmp(emp);
    setCredForm({
      email: emp.email,
      password: emp.password || `Nex@${Math.floor(1000 + Math.random() * 9000)}`,
      showPassword: true,
    });
    setShowConfirmModal(true);
  };

  // Save Credentials and Set Status to Confirmed
  const handleConfirmCredentials = async (e) => {
    e.preventDefault();
    if (!credForm.email || !credForm.password) {
      alert("Please provide both email and password for the employee.");
      return;
    }

    setConfirmLoading(true);
    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/employees/${targetEmp._id || targetEmp.empId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Confirmed",
          email: credForm.email,
          password: credForm.password,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployees(
          employees.map((emp) =>
            (emp._id === updated._id || emp.empId === updated.empId) ? updated : emp
          )
        );
        setShowConfirmModal(false);
        showToastMsg(`🎉 Confirmed ${updated.name}! Login credentials activated.`);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error confirming employee credentials");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Status Dropdown Change directly
  const handleStatusChange = async (emp, newStatus) => {
    if (newStatus === "Confirmed") {
      openConfirmModal(emp);
      return;
    }

    if (newStatus === "Pending") {
      if (
        !window.confirm(
          `Change status of ${emp.name} to Pending? Their employee login will be temporarily disabled.`
        )
      ) {
        return;
      }

      const token = localStorage.getItem("nex_admin_token");
      try {
        const res = await fetch(`/api/employees/${emp._id || emp.empId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Pending",
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setEmployees(
            employees.map((e) =>
              (e._id === updated._id || e.empId === updated.empId) ? updated : e
            )
          );
          showToastMsg(`ℹ️ ${emp.name} status changed to Pending.`);
        }
      } catch (err) {
        alert("Failed to update status");
      }
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Are you sure you want to remove ${emp.name} (${emp.empId})?`)) return;

    const token = localStorage.getItem("nex_admin_token");
    try {
      const res = await fetch(`/api/employees/${emp._id || emp.empId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEmployees(employees.filter((e) => e._id !== emp._id && e.empId !== emp.empId));
        showToastMsg(`🗑️ Removed employee ${emp.name}`);
      }
    } catch (err) {
      alert("Error deleting employee");
    }
  };

  // ── ADVANCED FILTER LOGIC & PDF GENERATOR ──
  const getFilteredAttendance = () => {
    return allAttendance.filter((a) => {
      const matchesEmp = advFilter.empId === "All" || a.employeeId === advFilter.empId;
      const empObj = employees.find((e) => e.empId === a.employeeId);
      const matchesDept = advFilter.department === "All" || (empObj && empObj.department === advFilter.department);
      const d = a.date || "";
      const matchesDate = (!advFilter.fromDate || d >= advFilter.fromDate) && (!advFilter.toDate || d <= advFilter.toDate);
      return matchesEmp && matchesDept && matchesDate;
    });
  };

  const getFilteredLeaves = () => {
    return allLeaves.filter((l) => {
      const matchesEmp = advFilter.empId === "All" || l.employeeId === advFilter.empId;
      const empObj = employees.find((e) => e.empId === l.employeeId);
      const matchesDept = advFilter.department === "All" || (empObj && empObj.department === advFilter.department);
      const d = l.fromDate || "";
      const matchesDate = (!advFilter.fromDate || d >= advFilter.fromDate) && (!advFilter.toDate || d <= advFilter.toDate);
      return matchesEmp && matchesDept && matchesDate;
    });
  };

  // Quick Date Range Presets
  const setQuickDateRange = (type) => {
    const today = new Date();
    if (type === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];
      setAdvFilter({ ...advFilter, fromDate: firstDay, toDate: todayStr });
    } else if (type === "lastMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
      setAdvFilter({ ...advFilter, fromDate: firstDay, toDate: lastDay });
    } else if (type === "last30Days") {
      const past30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      setAdvFilter({ ...advFilter, fromDate: past30, toDate: today.toISOString().split("T")[0] });
    } else if (type === "allTime") {
      setAdvFilter({ ...advFilter, fromDate: "", toDate: "" });
    }
  };

  // DOWNLOAD PDF HANDLER
  const handleDownloadPDF = () => {
    const filteredAtt = getFilteredAttendance();
    const filteredLv = getFilteredLeaves();

    const selectedEmpObj = employees.find((e) => e.empId === advFilter.empId);
    const empNameDisplay = selectedEmpObj ? `${selectedEmpObj.name} (${selectedEmpObj.empId})` : "All Employees";
    const dateRangeDisplay = `${advFilter.fromDate || "All time"} to ${advFilter.toDate || "Today"}`;

    const printWindow = window.open("", "_blank", "width=900,height=750");
    if (!printWindow) {
      alert("Please allow popups to export the PDF report.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nexprobyte - Attendance & Leave Report (${dateRangeDisplay})</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo-badge { background: #ff4d6d; color: #fff; width: 38px; height: 38px; border-radius: 8px; font-weight: 900; font-size: 20px; display: flex; align-items: center; justify-content: center; }
          .company-name { font-size: 20px; font-weight: 800; color: #0f172a; }
          .report-meta { text-align: right; font-size: 12px; color: #64748b; line-height: 1.4; }
          .report-title { font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
          .filter-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 12.5px; display: flex; justify-content: space-between; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fff; text-align: center; }
          .stat-val { font-size: 22px; font-weight: 800; color: #0f172a; }
          .stat-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px; font-weight: 600; }
          .section-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 24px 0 10px; border-left: 4px solid #ff4d6d; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; border: 1px solid #e2e8f0; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; }
          .badge-present { background: #ecfdf5; color: #059669; }
          .badge-late { background: #fffbeb; color: #d97706; }
          .badge-approved { background: #ecfdf5; color: #059669; }
          .badge-pending { background: #fffbeb; color: #d97706; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-badge">N</div>
            <div>
              <div class="company-name">Nexprobyte Technologies</div>
              <div style="font-size: 11px; color: #64748b;">Enterprise Employee Attendance &amp; Leave Portal</div>
            </div>
          </div>
          <div class="report-meta">
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
            <div><strong>Authorized:</strong> Super Admin</div>
          </div>
        </div>

        <div class="report-title">Monthly Punch-in Attendance &amp; Leave Summary Report</div>
        <div class="filter-bar">
          <div><strong>Employee:</strong> ${empNameDisplay}</div>
          <div><strong>Department:</strong> ${advFilter.department}</div>
          <div><strong>Date Range:</strong> ${dateRangeDisplay}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-val" style="color: #10b981;">${filteredAtt.filter((a) => a.status === "Present").length}</div>
            <div class="stat-lbl">Present Days</div>
          </div>
          <div class="stat-card">
            <div class="stat-val" style="color: #f59e0b;">${filteredAtt.filter((a) => a.status === "Late").length}</div>
            <div class="stat-lbl">Late Punches</div>
          </div>
          <div class="stat-card">
            <div class="stat-val" style="color: #ea580c;">${filteredLv.filter((l) => l.status === "Approved").length}</div>
            <div class="stat-lbl">Approved Leaves</div>
          </div>
          <div class="stat-card">
            <div class="stat-val" style="color: #3b82f6;">${filteredLv.filter((l) => l.status === "Pending").length}</div>
            <div class="stat-lbl">Pending Leaves</div>
          </div>
        </div>

        ${(advFilter.category === "All" || advFilter.category === "PunchIn") ? `
          <div class="section-title">⏱️ Punch-in Attendance Logs (${filteredAtt.length})</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAtt.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:16px;">No attendance records found for this period.</td></tr>' :
                filteredAtt.map((a) => `
                  <tr>
                    <td><strong>${a.date}</strong></td>
                    <td>${a.employeeName} (${a.employeeId})</td>
                    <td>${a.clockIn || '—'}</td>
                    <td>${a.clockOut || '—'}</td>
                    <td>${a.totalHours}</td>
                    <td><span class="badge ${a.status === 'Present' ? 'badge-present' : 'badge-late'}">${a.status}</span></td>
                    <td>${a.notes || 'Office entry'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        ` : ''}

        ${(advFilter.category === "All" || advFilter.category === "Leaves") ? `
          <div class="section-title">🌴 Leave &amp; Time-off Applications (${filteredLv.length})</div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Feedback</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLv.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:16px;">No leave records found for this period.</td></tr>' :
                filteredLv.map((l) => `
                  <tr>
                    <td>${l.employeeName} (${l.employeeId})</td>
                    <td><strong>${l.leaveType}</strong></td>
                    <td>${l.fromDate}</td>
                    <td>${l.toDate}</td>
                    <td>${l.days} Day(s)</td>
                    <td>${l.reason}</td>
                    <td><span class="badge ${l.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${l.status}</span></td>
                    <td>${l.adminRemark || '—'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          <div>Nexprobyte Technologies Pvt. Ltd. • Confidential HR Report</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filtered employees for main table
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch =
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.empId?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q);

    const matchesDept = filterDept === "All" || emp.department === filterDept;
    const matchesStatus = filterStatus === "All" || emp.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCount = employees.length;
  const confirmedCount = employees.filter((e) => e.status === "Confirmed").length;
  const pendingCount = employees.filter((e) => e.status === "Pending").length;
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  // Filtered preview data for drawer
  const drawerFilteredAtt = getFilteredAttendance();
  const drawerFilteredLv = getFilteredLeaves();

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="paces-page-header">
        <div>
          <div className="paces-page-title">All Employee Details</div>
          <div className="paces-breadcrumb">
            Nexprobyte <span>›</span> Management <span>›</span> Employees &amp; Attendance
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Advanced Filter & PDF Drawer Button */}
          <button
            className="paces-btn paces-btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowFilterDrawer(true)}
          >
            <span>🎛️</span>
            <span>Advanced Calendar Filter &amp; PDF</span>
          </button>
          <button className="paces-btn paces-btn-outline" onClick={fetchEmployees}>
            ↻ &nbsp;Refresh
          </button>
          <button className="paces-btn paces-btn-coral" onClick={() => setShowAddModal(true)}>
            + &nbsp;Add Employee
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="paces-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="paces-stat-card">
          <div className="paces-stat-label">Total Registered Employees</div>
          <div className="paces-stat-value">{totalCount}</div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Across {departments.length || 3} departments</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Confirmed &amp; Active Logins</div>
          <div className="paces-stat-value" style={{ color: "#10b981" }}>
            {confirmedCount}
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-up">Credentials active</span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Pending Admin Confirmation</div>
          <div className="paces-stat-value" style={{ color: "#f59e0b" }}>
            {pendingCount}
          </div>
          <div className="paces-stat-footer">
            <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: 700 }}>
              Needs password setup
            </span>
          </div>
        </div>

        <div className="paces-stat-card">
          <div className="paces-stat-label">Super Admin Access</div>
          <div className="paces-stat-value" style={{ color: "#ff4d6d", fontSize: "22px" }}>
            Full Control
          </div>
          <div className="paces-stat-footer">
            <span className="paces-stat-neutral">Status 1: Super Admin</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div
        className="paces-card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <input
            type="text"
            className="paces-input"
            placeholder="Search employee by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            🔍
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            className="paces-input"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ width: "auto", minWidth: "150px" }}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>

          <select
            className="paces-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto", minWidth: "150px" }}
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed (Active Login)</option>
            <option value="Pending">Pending (Not Created)</option>
          </select>

          <button
            onClick={() => setShowFilterDrawer(true)}
            className="paces-btn paces-btn-outline"
            style={{ fontSize: "12px", padding: "8px 12px" }}
          >
            📅 Filter by Date
          </button>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="paces-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--p-card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--p-text-dark)" }}>
              Employee Directory ({filteredEmployees.length})
            </div>
            <div style={{ fontSize: "12px", color: "var(--p-text-muted)" }}>
              Click <strong>View Details</strong> to expand attendance counts, leaves, and daily work reports below each employee.
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--p-text-muted)" }}>
            Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--p-text-muted)" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--p-text-dark)" }}>
              No employees found
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Try adjusting your search query or department filter.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="paces-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--p-card-border)", textAlign: "left" }}>
                  <th style={{ padding: "14px 20px" }}>Employee</th>
                  <th style={{ padding: "14px 20px" }}>Contact</th>
                  <th style={{ padding: "14px 20px" }}>Department &amp; Role</th>
                  <th style={{ padding: "14px 20px" }}>Joining Date</th>
                  <th style={{ padding: "14px 20px" }}>Account Status</th>
                  <th style={{ padding: "14px 20px" }}>Today's Attendance</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const isConfirmed = emp.status === "Confirmed";
                  const isExpanded = expandedEmpId === emp.empId;
                  const activity = empActivityMap[emp.empId] || { attendance: [], workReports: [], leaves: [], loading: false };
                  const activeTab = expandedTabMap[emp.empId] || "attendance";

                  // Statistics calculation for counts
                  const attList = activity.attendance || [];
                  const lvList = activity.leaves || [];
                  const wrList = activity.workReports || [];

                  const presentCount = attList.filter((a) => a.status === "Present").length;
                  const lateCount = attList.filter((a) => a.status === "Late").length;
                  const approvedLeavesCount = lvList.filter((l) => l.status === "Approved").length;
                  const pendingLeavesCount = lvList.filter((l) => l.status === "Pending").length;
                  const totalLeaveDays = lvList.reduce((acc, curr) => acc + (Number(curr.days) || 0), 0);

                  return (
                    <React.Fragment key={emp._id || emp.empId}>
                      <tr
                        style={{
                          borderBottom: isExpanded ? "none" : "1px solid var(--p-card-border)",
                          background: isExpanded ? "rgba(255, 77, 109, 0.03)" : "transparent",
                          transition: "background 0.2s ease",
                        }}
                      >
                        {/* Name & ID */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: isConfirmed ? "#ecfdf5" : "#fffbeb",
                                color: isConfirmed ? "#059669" : "#d97706",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "15px",
                                border: `1px solid ${isConfirmed ? "#a7f3d0" : "#fde68a"}`,
                              }}
                            >
                              {emp.name[0]?.toUpperCase() || "E"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--p-text-dark)", fontSize: "14px" }}>
                                {emp.name}
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  marginTop: "2px",
                                }}
                              >
                                {emp.empId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-text-dark)" }}>
                            {emp.email}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "var(--p-text-muted)" }}>
                            {emp.phone || "No phone added"}
                          </div>
                        </td>

                        {/* Department & Role */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-text-dark)" }}>
                            {emp.designation}
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              background: "rgba(59, 130, 246, 0.1)",
                              color: "#2563eb",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              display: "inline-block",
                              marginTop: "3px",
                            }}
                          >
                            {emp.department}
                          </span>
                        </td>

                        {/* Joining Date */}
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--p-text-muted)" }}>
                          {emp.joiningDate || "2026-01-01"}
                        </td>

                        {/* Status Dropdown */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <select
                              value={emp.status}
                              onChange={(e) => handleStatusChange(emp, e.target.value)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                border: isConfirmed ? "1px solid #10b981" : "1px solid #f59e0b",
                                background: isConfirmed ? "#ecfdf5" : "#fffbeb",
                                color: isConfirmed ? "#065f46" : "#92400e",
                                outline: "none",
                              }}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Confirmed">✅ Confirmed</option>
                            </select>

                            {!isConfirmed ? (
                              <button
                                type="button"
                                onClick={() => openConfirmModal(emp)}
                                className="paces-btn paces-btn-coral paces-btn-sm"
                                style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                                title="Set login email & password to confirm"
                              >
                                Set Password &amp; Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openConfirmModal(emp)}
                                className="paces-btn paces-btn-outline paces-btn-sm"
                                style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                                title="Update employee login password"
                              >
                                🔑 Credentials
                              </button>
                            )}
                          </div>
                          {isConfirmed ? (
                            <div style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", fontWeight: 600 }}>
                              ● Credentials active
                            </div>
                          ) : (
                            <div style={{ fontSize: "11px", color: "#d97706", marginTop: "4px" }}>
                              ⚠️ Login blocked until confirmed
                            </div>
                          )}
                        </td>

                        {/* Today's Attendance (Punch In / Punch Out) */}
                        <td style={{ padding: "14px 20px" }}>
                          {(() => {
                            const todayRec = todayAttendanceMap[emp.empId];
                            const isPunchLoading = punchLoadingEmpId === emp.empId;

                            if (!todayRec || !todayRec.clockIn) {
                              // 1. Not punched in yet -> Show ONLY "Punch In" button
                              return (
                                <button
                                  type="button"
                                  onClick={() => handlePunchIn(emp)}
                                  disabled={isPunchLoading}
                                  className="paces-btn paces-btn-coral paces-btn-sm"
                                  style={{
                                    background: "#10b981",
                                    borderColor: "#10b981",
                                    color: "#fff",
                                    fontWeight: 700,
                                    padding: "6px 14px",
                                    fontSize: "12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span>🟢</span>
                                  <span>{isPunchLoading ? "Punching In..." : "Punch In"}</span>
                                </button>
                              );
                            }

                            if (!todayRec.clockOut) {
                              // 2. Punched in, but not punched out -> NEXT ONLY show "Punch Out" button!
                              return (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      background: todayRec.status === "Present" ? "#ecfdf5" : "#fffbeb",
                                      color: todayRec.status === "Present" ? "#059669" : "#d97706",
                                      padding: "4px 8px",
                                      borderRadius: "6px",
                                      border: `1px solid ${todayRec.status === "Present" ? "#a7f3d0" : "#fde68a"}`,
                                    }}
                                  >
                                    ● In: {todayRec.clockIn}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handlePunchOut(emp)}
                                    disabled={isPunchLoading}
                                    className="paces-btn paces-btn-coral paces-btn-sm"
                                    style={{
                                      background: "#ef4444",
                                      borderColor: "#ef4444",
                                      color: "#fff",
                                      fontWeight: 700,
                                      padding: "6px 14px",
                                      fontSize: "12px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <span>🛑</span>
                                    <span>{isPunchLoading ? "Punching Out..." : "Punch Out"}</span>
                                  </button>
                                </div>
                              );
                            }

                            // 3. Punched out -> Shift Completed, show details and re-punch button
                            return (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span
                                  style={{
                                    fontSize: "11.5px",
                                    fontWeight: 700,
                                    background: "#f1f5f9",
                                    color: "#334155",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                  }}
                                >
                                  ✓ Out: {todayRec.clockOut} ({todayRec.totalHours})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePunchIn(emp)}
                                  disabled={isPunchLoading}
                                  className="paces-btn paces-btn-outline paces-btn-sm"
                                  style={{ padding: "3px 8px", fontSize: "11px" }}
                                  title="Punch in again"
                                >
                                  ↻ Re-Punch
                                </button>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            {/* Toggle Dropdown Accordion Button */}
                            <button
                              type="button"
                              onClick={() => toggleEmployeeDetails(emp)}
                              className={`paces-btn paces-btn-sm ${isExpanded ? "paces-btn-coral" : "paces-btn-outline"}`}
                              style={{ display: "flex", alignItems: "center", gap: "4px" }}
                              title="Toggle activity dropdown"
                            >
                              <span>{isExpanded ? "▲ Hide Details" : "▼ View Details"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirmModal(emp)}
                              className="paces-btn paces-btn-outline paces-btn-sm"
                              title="Edit credentials or reset password"
                            >
                              🔑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(emp)}
                              className="paces-btn paces-btn-ghost paces-btn-sm"
                              style={{ color: "#ef4444" }}
                              title="Delete employee"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── INLINE ACCORDION DROPDOWN ROW (Right Below Employee Row, No Popup!) ── */}
                      {isExpanded && (
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                          <td colSpan={7} style={{ padding: "20px 24px" }}>
                            <div
                              style={{
                                background: "#fff",
                                borderRadius: "14px",
                                padding: "20px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                              }}
                            >
                              {/* 1. Header with Employee Summary & Counts */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "12px",
                                  borderBottom: "1px solid #f1f5f9",
                                  paddingBottom: "16px",
                                  marginBottom: "16px",
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                                    Activity &amp; Records Overview: {emp.name} ({emp.empId})
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    {emp.designation} • {emp.department} • Status:{" "}
                                    <strong style={{ color: isConfirmed ? "#10b981" : "#f59e0b" }}>
                                      {emp.status}
                                    </strong>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setExpandedEmpId(null)}
                                  className="paces-btn paces-btn-ghost paces-btn-sm"
                                  style={{ color: "#64748b", fontSize: "12px" }}
                                >
                                  ▲ Close Dropdown
                                </button>
                              </div>

                              {/* 2. Login Count & Leave Count Stat Chips (User request) */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                  gap: "12px",
                                  marginBottom: "20px",
                                }}
                              >
                                {/* Login / Attendance Count Box */}
                                <div
                                  style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "10px",
                                    padding: "12px 16px",
                                  }}
                                >
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                                    ⏱️ Login / Punch Count
                                  </div>
                                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#15803d", marginTop: "2px" }}>
                                    {attList.length} <span style={{ fontSize: "12px", fontWeight: 600 }}>Total Punches</span>
                                  </div>
                                  <div style={{ fontSize: "11.5px", color: "#166534", marginTop: "2px" }}>
                                    <strong>{presentCount}</strong> Present • <strong>{lateCount}</strong> Late Check-ins
                                  </div>
                                </div>

                                {/* Leave Count Box */}
                                <div
                                  style={{
                                    background: "#fff7ed",
                                    border: "1px solid #fed7aa",
                                    borderRadius: "10px",
                                    padding: "12px 16px",
                                  }}
                                >
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", textTransform: "uppercase" }}>
                                    🌴 Leave Applications Count
                                  </div>
                                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#c2410c", marginTop: "2px" }}>
                                    {lvList.length} <span style={{ fontSize: "12px", fontWeight: 600 }}>Requests</span>
                                  </div>
                                  <div style={{ fontSize: "11.5px", color: "#9a3412", marginTop: "2px" }}>
                                    <strong>{approvedLeavesCount}</strong> Approved • <strong>{pendingLeavesCount}</strong> Pending ({totalLeaveDays} Days)
                                  </div>
                                </div>

                                {/* Daily Work Uploads Box */}
                                <div
                                  style={{
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "10px",
                                    padding: "12px 16px",
                                  }}
                                >
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>
                                    📝 Work Status Deliverables
                                  </div>
                                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb", marginTop: "2px" }}>
                                    {wrList.length} <span style={{ fontSize: "12px", fontWeight: 600 }}>Uploaded</span>
                                  </div>
                                  <div style={{ fontSize: "11.5px", color: "#1e40af", marginTop: "2px" }}>
                                    Daily task logs &amp; deliverables
                                  </div>
                                </div>
                              </div>

                              {/* 3. Sub-Tab Switcher inside Dropdown */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  borderBottom: "1px solid #e2e8f0",
                                  marginBottom: "16px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setExpandedTabMap({ ...expandedTabMap, [emp.empId]: "attendance" })}
                                  style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "13px",
                                    fontWeight: activeTab === "attendance" ? "700" : "600",
                                    color: activeTab === "attendance" ? "#ff4d6d" : "#64748b",
                                    borderBottom: activeTab === "attendance" ? "2px solid #ff4d6d" : "2px solid transparent",
                                    cursor: "pointer",
                                  }}
                                >
                                  ⏱️ Attendance Punch Logs ({attList.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTabMap({ ...expandedTabMap, [emp.empId]: "leaves" })}
                                  style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "13px",
                                    fontWeight: activeTab === "leaves" ? "700" : "600",
                                    color: activeTab === "leaves" ? "#ff4d6d" : "#64748b",
                                    borderBottom: activeTab === "leaves" ? "2px solid #ff4d6d" : "2px solid transparent",
                                    cursor: "pointer",
                                  }}
                                >
                                  🌴 Leave Requests ({lvList.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTabMap({ ...expandedTabMap, [emp.empId]: "work" })}
                                  style={{
                                    padding: "8px 16px",
                                    border: "none",
                                    background: "none",
                                    fontSize: "13px",
                                    fontWeight: activeTab === "work" ? "700" : "600",
                                    color: activeTab === "work" ? "#ff4d6d" : "#64748b",
                                    borderBottom: activeTab === "work" ? "2px solid #ff4d6d" : "2px solid transparent",
                                    cursor: "pointer",
                                  }}
                                >
                                  📝 Daily Work Reports ({wrList.length})
                                </button>
                              </div>

                              {/* 4. Sub-Tab Content Rendering */}
                              {activity.loading ? (
                                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                                  Loading details...
                                </div>
                              ) : activeTab === "attendance" ? (
                                attList.length === 0 ? (
                                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                    No attendance punch logs found for this employee.
                                  </div>
                                ) : (
                                  <div style={{ maxHeight: "220px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                                    <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                                      <thead>
                                        <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                                          <th style={{ padding: "8px 12px" }}>Date</th>
                                          <th style={{ padding: "8px 12px" }}>Clock In</th>
                                          <th style={{ padding: "8px 12px" }}>Clock Out</th>
                                          <th style={{ padding: "8px 12px" }}>Duration</th>
                                          <th style={{ padding: "8px 12px" }}>Status</th>
                                          <th style={{ padding: "8px 12px" }}>Remarks</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {attList.map((a, i) => (
                                          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px 12px", fontWeight: 700 }}>{a.date}</td>
                                            <td style={{ padding: "8px 12px" }}>{a.clockIn || "—"}</td>
                                            <td style={{ padding: "8px 12px" }}>{a.clockOut || "Working..."}</td>
                                            <td style={{ padding: "8px 12px" }}>{a.totalHours}</td>
                                            <td style={{ padding: "8px 12px" }}>
                                              <span
                                                style={{
                                                  fontSize: "10.5px",
                                                  padding: "2px 6px",
                                                  borderRadius: "4px",
                                                  fontWeight: 700,
                                                  background: a.status === "Present" ? "#ecfdf5" : "#fffbeb",
                                                  color: a.status === "Present" ? "#059669" : "#d97706",
                                                }}
                                              >
                                                {a.status}
                                              </span>
                                            </td>
                                            <td style={{ padding: "8px 12px", color: "#64748b" }}>{a.notes || "—"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )
                              ) : activeTab === "leaves" ? (
                                lvList.length === 0 ? (
                                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                    No leave requests submitted by this employee.
                                  </div>
                                ) : (
                                  <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {lvList.map((lv, i) => (
                                      <div
                                        key={i}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          background: "#f8fafc",
                                          border: "1px solid #e2e8f0",
                                          padding: "10px 14px",
                                          borderRadius: "8px",
                                          fontSize: "12px",
                                        }}
                                      >
                                        <div>
                                          <strong>{lv.leaveType}</strong>: {lv.fromDate} ➔ {lv.toDate} ({lv.days} day{lv.days > 1 ? "s" : ""})
                                          <div style={{ color: "#64748b", marginTop: "2px" }}>Reason: {lv.reason}</div>
                                          {lv.adminRemark && (
                                            <div style={{ color: "#059669", marginTop: "2px" }}>Admin Note: {lv.adminRemark}</div>
                                          )}
                                        </div>
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            padding: "3px 10px",
                                            borderRadius: "12px",
                                            background:
                                              lv.status === "Approved"
                                                ? "#ecfdf5"
                                                : lv.status === "Rejected"
                                                ? "#fef2f2"
                                                : "#fffbeb",
                                            color:
                                              lv.status === "Approved"
                                                ? "#059669"
                                                : lv.status === "Rejected"
                                                ? "#dc2626"
                                                : "#d97706",
                                          }}
                                        >
                                          {lv.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )
                              ) : (
                                wrList.length === 0 ? (
                                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                    No daily work status reports submitted yet.
                                  </div>
                                ) : (
                                  <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {wrList.map((wr, i) => (
                                      <div
                                        key={i}
                                        style={{
                                          background: "#f8fafc",
                                          border: "1px solid #e2e8f0",
                                          padding: "10px 14px",
                                          borderRadius: "8px",
                                          fontSize: "12px",
                                        }}
                                      >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <strong style={{ color: "#0f172a" }}>{wr.projectTitle}</strong>
                                          <span style={{ color: "#64748b" }}>{wr.date} • {wr.hoursSpent} hrs</span>
                                        </div>
                                        <p style={{ margin: "4px 0", color: "#334155" }}>{wr.taskDetails}</p>
                                        {wr.link && (
                                          <a
                                            href={wr.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: "#2563eb", fontWeight: 600, display: "inline-block", marginTop: "2px" }}
                                          >
                                            🔗 Deliverable Link →
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: Create / Confirm Credentials ── */}
      {showConfirmModal && targetEmp && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowConfirmModal(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 480 }}>
            <div className="paces-modal-header">
              <div>
                <div className="paces-modal-title">🔐 Employee Login Setup</div>
                <div style={{ fontSize: "12px", color: "var(--p-text-muted)", marginTop: "2px" }}>
                  Confirm {targetEmp.name} ({targetEmp.empId}) &amp; generate credentials
                </div>
              </div>
              <button className="paces-modal-close" onClick={() => setShowConfirmModal(false)}>
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1e40af",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "12.5px",
                marginBottom: "16px",
              }}
            >
              ℹ️ <strong>Status Confirmation Rule:</strong> The employee can only log in once you confirm
              their status and create their email ID &amp; password here.
            </div>

            <form onSubmit={handleConfirmCredentials}>
              <div className="paces-form-group">
                <label className="paces-label">Employee Login Email ID</label>
                <input
                  type="email"
                  className="paces-input"
                  value={credForm.email}
                  onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="paces-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="paces-label">Assign Password</label>
                  <button
                    type="button"
                    onClick={() =>
                      setCredForm({
                        ...credForm,
                        password: `Nex@${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d6d",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🎲 Auto-generate
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={credForm.showPassword ? "text" : "password"}
                    className="paces-input"
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                    placeholder="Enter password for employee"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCredForm({ ...credForm, showPassword: !credForm.showPassword })}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {credForm.showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong>Summary of Account:</strong>
                </div>
                <div style={{ color: "#475569", marginTop: "4px" }}>
                  Status will become: <strong style={{ color: "#10b981" }}>Confirmed</strong>
                </div>
                <div style={{ color: "#475569" }}>
                  Employee ID: <strong>{targetEmp.empId}</strong>
                </div>
              </div>

              <div className="paces-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="paces-btn paces-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral" disabled={confirmLoading}>
                  {confirmLoading ? "Saving..." : "✓ Confirm & Save Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Add New Employee ── */}
      {showAddModal && (
        <div
          className="paces-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="paces-modal" style={{ maxWidth: 520 }}>
            <div className="paces-modal-header">
              <div className="paces-modal-title">➕ Register New Employee</div>
              <button className="paces-modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="paces-form-group">
                <label className="paces-label">Full Name *</label>
                <input
                  type="text"
                  className="paces-input"
                  placeholder="e.g. Vignesh Waran"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="paces-form-group">
                  <label className="paces-label">Official Email *</label>
                  <input
                    type="email"
                    className="paces-input"
                    placeholder="vignesh@nexprobyte.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    required
                  />
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Phone Number</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="+91 98765 43210"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="paces-form-group">
                  <label className="paces-label">Department</label>
                  <select
                    className="paces-input"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Designation</label>
                  <input
                    type="text"
                    className="paces-input"
                    placeholder="e.g. React Developer"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="paces-form-group">
                  <label className="paces-label">Joining Date</label>
                  <input
                    type="date"
                    className="paces-input"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                  />
                </div>

                <div className="paces-form-group">
                  <label className="paces-label">Initial Status</label>
                  <select
                    className="paces-input"
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                  >
                    <option value="Pending">Pending (Set password later)</option>
                    <option value="Confirmed">Confirmed (Default password)</option>
                  </select>
                </div>
              </div>

              <div className="paces-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="paces-btn paces-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="paces-btn paces-btn-coral" disabled={addLoading}>
                  {addLoading ? "Adding..." : "+ Create Employee Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADVANCED CALENDAR FILTER & PDF DOWNLOAD SLIDE-OVER DRAWER (User request) ── */}
      {showFilterDrawer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowFilterDrawer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "100%",
              background: "#fff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.25s ease-out",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                  🎛️ Advanced Calendar Filter
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Filter monthly punch-in attendance &amp; leaves, export PDF
                </div>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body Form Controls */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {/* 1. Employee Filter */}
              <div className="paces-form-group">
                <label className="paces-label">Select Employee</label>
                <select
                  className="paces-input"
                  value={advFilter.empId}
                  onChange={(e) => setAdvFilter({ ...advFilter, empId: e.target.value })}
                >
                  <option value="All">All Employees ({employees.length})</option>
                  {employees.map((e) => (
                    <option key={e.empId} value={e.empId}>
                      {e.name} ({e.empId}) - {e.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Department Filter */}
              <div className="paces-form-group">
                <label className="paces-label">Department / Role Category</label>
                <select
                  className="paces-input"
                  value={advFilter.department}
                  onChange={(e) => setAdvFilter({ ...advFilter, department: e.target.value })}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* 3. Report Scope */}
              <div className="paces-form-group">
                <label className="paces-label">Filter Category</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { id: "All", label: "All Data" },
                    { id: "PunchIn", label: "⏱️ Punch-in" },
                    { id: "Leaves", label: "🌴 Leaves" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAdvFilter({ ...advFilter, category: cat.id })}
                      style={{
                        padding: "8px 6px",
                        fontSize: "12px",
                        fontWeight: advFilter.category === cat.id ? "700" : "600",
                        borderRadius: "8px",
                        border: advFilter.category === cat.id ? "2px solid #ff4d6d" : "1px solid #e2e8f0",
                        background: advFilter.category === cat.id ? "#fff0f3" : "#f8fafc",
                        color: advFilter.category === cat.id ? "#ff4d6d" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Calendar Date Range Picker (User request) */}
              <div style={{ margin: "20px 0", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", marginBottom: "8px" }}>
                  📅 Calendar Date Range
                </div>

                {/* Quick Presets */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setQuickDateRange("thisMonth")}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDateRange("lastMonth")}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    Last Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDateRange("last30Days")}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDateRange("allTime")}
                    className="paces-btn paces-btn-outline paces-btn-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    All Time
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>From Date</label>
                    <input
                      type="date"
                      className="paces-input"
                      value={advFilter.fromDate}
                      onChange={(e) => setAdvFilter({ ...advFilter, fromDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>To Date</label>
                    <input
                      type="date"
                      className="paces-input"
                      value={advFilter.toDate}
                      onChange={(e) => setAdvFilter({ ...advFilter, toDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Live Filter Result Statistics */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
                  📊 Filtered Records Summary:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#10b981" }}>
                      {drawerFilteredAtt.filter((a) => a.status === "Present").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Present Days</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>
                      {drawerFilteredAtt.filter((a) => a.status === "Late").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Late Punches</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#ea580c" }}>
                      {drawerFilteredLv.filter((l) => l.status === "Approved").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Approved Leaves</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563eb" }}>
                      {drawerFilteredLv.filter((l) => l.status === "Pending").length}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Pending Leaves</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions: Download PDF */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "10px",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="paces-btn paces-btn-outline"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Close Drawer
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="paces-btn paces-btn-coral"
                style={{ flex: 1.4, justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>📥</span>
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
