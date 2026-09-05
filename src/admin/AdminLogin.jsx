import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-styles.css";

export function AdminLogin() {
  // Login Role / Status Tab: 'super_admin' (Status 1) or 'employee' (Status 2)
  const [loginRole, setLoginRole] = useState("super_admin");

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("admin-route");
    // If already logged in, redirect to admin dashboard
    const token = localStorage.getItem("nex_admin_token");
    if (token) {
      navigate("/admin", { replace: true });
    }
    return () => {
      document.body.classList.remove("admin-route");
    };
  }, [navigate]);

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const isSuperAdmin = loginRole === "super_admin";
    const identifier = isSuperAdmin ? username.trim() : employeeEmail.trim();
    const pass = isSuperAdmin ? password.trim() : employeePassword.trim();

    if (!identifier || !pass) {
      setError(
        isSuperAdmin
          ? "Please enter both Super Admin username and password."
          : "Please enter your employee email ID and password."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: isSuperAdmin ? identifier : undefined,
          email: !isSuperAdmin ? identifier : undefined,
          password: pass,
          loginType: loginRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      localStorage.setItem("nex_admin_token", data.token);
      localStorage.setItem("nex_admin_user", JSON.stringify(data.user));
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-wrap paces-admin-root"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        cursor: "default",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#fff",
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.12)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ff4d6d 0%, #e11d48 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "20px",
              boxShadow: "0 8px 16px rgba(255, 77, 109, 0.25)",
            }}
          >
            N
          </div>
          <div>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
              Nexprobyte Portal
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              Management &amp; Employee System
            </div>
          </div>
        </div>

        {/* ── Status / Role Tabs ── */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "14px",
            padding: "4px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSwitch("super_admin")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: loginRole === "super_admin" ? "#fff" : "transparent",
              color: loginRole === "super_admin" ? "#0f172a" : "#64748b",
              fontWeight: loginRole === "super_admin" ? "700" : "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: loginRole === "super_admin" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>👑</span>
            <span>Status 1: Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch("employee")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: loginRole === "employee" ? "#fff" : "transparent",
              color: loginRole === "employee" ? "#0f172a" : "#64748b",
              fontWeight: loginRole === "employee" ? "700" : "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: loginRole === "employee" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <span>💼</span>
            <span>Status 2: Employee</span>
          </button>
        </div>

        {/* Dynamic Heading based on status */}
        <div style={{ marginBottom: "20px" }}>
          {loginRole === "super_admin" ? (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
                Super Admin Sign In
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Full administrative access, employee credential management &amp; CRM controls
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
                Employee Portal Login
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Log in to clock attendance, submit daily work status &amp; track leaves
              </p>
            </>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#dc2626",
              padding: "12px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "18px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {loginRole === "super_admin" ? (
            /* Super Admin Fields */
            <>
              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">Admin Username</label>
                <input
                  type="text"
                  className="paces-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="enter user name"
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="paces-label">Admin Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="paces-input"
                    style={{ paddingRight: "44px" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Employee Login Fields */
            <>
              <div style={{ marginBottom: "16px" }}>
                <label className="paces-label">Employee Email ID or ID</label>
                <input
                  type="text"
                  className="paces-input"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  placeholder="enter emailid"
                  required
                />
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Enter the email created &amp; confirmed by Super Admin
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="paces-label">Employee Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="paces-input"
                    style={{ paddingRight: "44px" }}
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    placeholder="enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="paces-btn paces-btn-coral"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              fontSize: "14px",
              fontWeight: "700",
              borderRadius: "12px",
            }}
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : loginRole === "super_admin"
              ? "Sign In as Super Admin →"
              : "Sign In to Employee Portal →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
