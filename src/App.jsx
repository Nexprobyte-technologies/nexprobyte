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
import { AdminCareers } from "./admin/AdminCareers.jsx";
import { AdminInquiries } from "./admin/AdminInquiries.jsx";
import { AdminAbout } from "./admin/AdminAbout.jsx";
import { AdminBlogs } from "./admin/AdminBlogs.jsx";

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check expiry (exp is in seconds)
    return payload.exp * 1000 > Date.now();
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="careers" element={<AdminCareers />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="about" element={<AdminAbout />} />
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