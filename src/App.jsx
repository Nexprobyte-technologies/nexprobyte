import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import ServicesIndex from "./pages/ServicesIndex.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import Blog from "./pages/Blog.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Careers from "./pages/Careers.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import JobApply from "./pages/JobApply.jsx";
import Contact from "./pages/Contact.jsx";

// Admin Panel Components
import { AdminLogin } from "./admin/AdminLogin.jsx";
import { AdminLayout } from "./admin/AdminLayout.jsx";
import { AdminDashboard } from "./admin/AdminDashboard.jsx";
import { AdminEmployees } from "./admin/AdminEmployees.jsx";
import { AdminCareers } from "./admin/AdminCareers.jsx";
import { AdminInquiries } from "./admin/AdminInquiries.jsx";
import { AdminAbout } from "./admin/AdminAbout.jsx";
import { AdminBlogs } from "./admin/AdminBlogs.jsx";
import { AdminProjects } from "./admin/AdminProjects.jsx";

// Employee Portal Components
import { EmployeeDashboard } from "./admin/employee/EmployeeDashboard.jsx";
import { EmployeeAttendance } from "./admin/employee/EmployeeAttendance.jsx";
import { EmployeeWorkStatus } from "./admin/employee/EmployeeWorkStatus.jsx";
import { EmployeeLeaves } from "./admin/employee/EmployeeLeaves.jsx";

function isTokenValid(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const payload = JSON.parse(atob(base64));
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("nex_admin_token");
  if (!token || !isTokenValid(token)) {
    // Clear invalid/expired token
    localStorage.removeItem("nex_admin_token");
    localStorage.removeItem("nex_admin_user");
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function SuperAdminOnlyRoute({ children }) {
  try {
    const user = JSON.parse(localStorage.getItem("nex_admin_user") || "{}");
    if (user.role === "employee") {
      return <Navigate to="/admin" replace />;
    }
  } catch (e) {}
  return children;
}

function AdminIndex() {
  try {
    const user = JSON.parse(localStorage.getItem("nex_admin_user") || "{}");
    if (user.role === "employee") {
      return <EmployeeDashboard />;
    }
  } catch (e) {}
  return <AdminDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin & Employee Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminIndex />} />

          {/* Super Admin Management Pages */}
          <Route
            path="employees"
            element={
              <SuperAdminOnlyRoute>
                <AdminEmployees />
              </SuperAdminOnlyRoute>
            }
          />
          <Route
            path="projects"
            element={
              <SuperAdminOnlyRoute>
                <AdminProjects />
              </SuperAdminOnlyRoute>
            }
          />
          <Route
            path="inquiries"
            element={
              <SuperAdminOnlyRoute>
                <AdminInquiries />
              </SuperAdminOnlyRoute>
            }
          />
          <Route
            path="careers"
            element={
              <SuperAdminOnlyRoute>
                <AdminCareers />
              </SuperAdminOnlyRoute>
            }
          />
          <Route
            path="blogs"
            element={
              <SuperAdminOnlyRoute>
                <AdminBlogs />
              </SuperAdminOnlyRoute>
            }
          />
          <Route
            path="about"
            element={
              <SuperAdminOnlyRoute>
                <AdminAbout />
              </SuperAdminOnlyRoute>
            }
          />

          {/* Employee Portal Pages */}
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="work-status" element={<EmployeeWorkStatus />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
        </Route>

        {/* Public Website Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesIndex />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<PostDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/apply" element={<JobApply />} />
          <Route path="/careers/:slug" element={<JobDetail />} />
          <Route path="/careers/:slug/apply" element={<JobApply />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}