import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";

// Public pages (code-split so the landing page downloads less JS)
const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const ServicesIndex = lazy(() => import("./pages/ServicesIndex.jsx"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const Careers = lazy(() => import("./pages/Careers.jsx"));
const JobDetail = lazy(() => import("./pages/JobDetail.jsx"));
const JobApply = lazy(() => import("./pages/JobApply.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const InterviewDataCollect = lazy(() => import("./pages/InterviewDataCollect.jsx"));

// Admin Panel Components (lazy loaded with named export fallback)
const AdminLogin = lazy(() => import("./admin/AdminLogin.jsx").then((m) => ({ default: m.AdminLogin || m.default })));
const AdminLayout = lazy(() => import("./admin/AdminLayout.jsx").then((m) => ({ default: m.AdminLayout || m.default })));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx").then((m) => ({ default: m.AdminDashboard || m.default })));
const AdminEmployees = lazy(() => import("./admin/AdminEmployees.jsx").then((m) => ({ default: m.AdminEmployees || m.default })));
const AdminCareers = lazy(() => import("./admin/AdminCareers.jsx").then((m) => ({ default: m.AdminCareers || m.default })));
const AdminInquiries = lazy(() => import("./admin/AdminInquiries.jsx").then((m) => ({ default: m.AdminInquiries || m.default })));
const AdminDatasCollect = lazy(() => import("./admin/AdminDatasCollect.jsx").then((m) => ({ default: m.AdminDatasCollect || m.default })));
const AdminJoinedEmployees = lazy(() => import("./admin/AdminJoinedEmployees.jsx").then((m) => ({ default: m.AdminJoinedEmployees || m.default })));
const AdminAbout = lazy(() => import("./admin/AdminAbout.jsx").then((m) => ({ default: m.AdminAbout || m.default })));
const AdminBlogs = lazy(() => import("./admin/AdminBlogs.jsx").then((m) => ({ default: m.AdminBlogs || m.default })));
const AdminProjects = lazy(() => import("./admin/AdminProjects.jsx").then((m) => ({ default: m.AdminProjects || m.default })));
const AdminAccounts = lazy(() => import("./admin/AdminAccounts.jsx").then((m) => ({ default: m.AdminAccounts || m.default })));

// Employee Portal Components
const EmployeeDashboard = lazy(() => import("./admin/employee/EmployeeDashboard.jsx").then((m) => ({ default: m.EmployeeDashboard || m.default })));
const EmployeeAttendance = lazy(() => import("./admin/employee/EmployeeAttendance.jsx").then((m) => ({ default: m.EmployeeAttendance || m.default })));
const EmployeeWorkStatus = lazy(() => import("./admin/employee/EmployeeWorkStatus.jsx").then((m) => ({ default: m.EmployeeWorkStatus || m.default })));
const EmployeeLeaves = lazy(() => import("./admin/employee/EmployeeLeaves.jsx").then((m) => ({ default: m.EmployeeLeaves || m.default })));

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

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: 14,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Loading…
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin & Employee Portal Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminLayout />
                </Suspense>
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
              path="accounts"
              element={
                <SuperAdminOnlyRoute>
                  <AdminAccounts />
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
              path="datas-collect"
              element={
                <SuperAdminOnlyRoute>
                  <AdminDatasCollect />
                </SuperAdminOnlyRoute>
              }
            />
            <Route
              path="joined-employees"
              element={
                <SuperAdminOnlyRoute>
                  <AdminJoinedEmployees />
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
            <Route path="/interview-data" element={<InterviewDataCollect />} />
            <Route path="/careers/:slug" element={<JobDetail />} />
            <Route path="/careers/:slug/apply" element={<JobApply />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}