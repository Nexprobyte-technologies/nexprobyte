# NEXPROBYTE — Digital Solutions Portal & Admin CRM System

Official full-stack web application for **Nexprobyte Technologies**, a Coimbatore-based digital solutions agency. Includes a high-performance React public website and a comprehensive **Paces CRM Luxe Admin Portal** powered by Node.js + Express REST API with MongoDB (plus automatic memory fallback storage).

---

## ⚡ Tech Stack Summary

| Component | Layer | Technology / Libraries |
| --- | --- | --- |
| **Frontend** | Framework | React 18 + Vite |
| | Routing | React Router v7 |
| | Animation | Framer Motion (motion/react) + GSAP + ScrollTrigger |
| | Styling | Custom CSS (styles.css, styles-pages.css, admin-styles.css) |
| **Backend** | Runtime | Node.js + Express |
| | Database | MongoDB + Mongoose (with active Memory Fallback Store) |
| | Auth | JSON Web Token (JWT) + bcryptjs |
| | Environment | dotenv, cors, body-parser (25MB payload limit for PDF uploads) |

---

## 🚀 How to Run (ReactJS + NodeJS + MongoDB)

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** *(Optional)* — If MongoDB is running at mongodb://127.0.0.1:27017/nexprobyte, the server connects automatically. If offline, the backend uses the built-in **Memory Fallback Store** so all features work seamlessly.

---

### Step 1: Install Dependencies
`ash
npm install
`

### Step 2: Configure Environment Variables
A .env file is located in the root directory:
`nv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nexprobyte
JWT_SECRET=nexprobyte_secret_key_2026
`

### Step 3: Run the Application

#### 🟢 Terminal 1 — Start Backend Node.js Server
`ash
npm run server
`
- Server starts at: **http://localhost:5000**
- Exposes REST API: /api/auth, /api/employees, /api/attendance, /api/leaves, /api/work-reports, /api/projects, /api/jobs, /api/applications, /api/inquiries, /api/posts, /api/about, /api/stats

#### 🔵 Terminal 2 — Start Frontend React App (Vite)
`ash
npm run dev
`
- Frontend app starts at: **http://localhost:5173**

### Step 4: Access Admin Panel

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public Website |
| http://localhost:5173/admin/login | Admin / Employee Login |
| http://localhost:5173/admin | Super Admin CRM Dashboard |
| http://localhost:5173/admin/employees | Employee Management |
| http://localhost:5173/admin/projects | Projects & Deliverables |
| http://localhost:5173/admin/attendance | Employee Attendance |
| http://localhost:5173/admin/leaves | Leave Tracker |
| http://localhost:5173/admin/work-status | Daily Work Status |

**Default Super Admin Login:**
- **Username**: NexAdmin
- **Password**: Nex@.1A

---

## 🔐 Dual-Role Login System

Two tabs on the same login page:

### Tab 1 — Super Admin (Status 1)
- Logs in with Username + Password.
- Full CRM access: Dashboard, Employees, Projects, Inquiries, Careers, Blogs, About Editor.
- Creates employee accounts (Email + Password) and sets status (Pending / Confirmed).
- Only Confirmed employees can log in.

### Tab 2 — Employee (Status 2)
- Logs in with Email + Password (created by Super Admin).
- Access to personal Employee Portal: Dashboard, Punch In/Out, Work Status, Leave Tracker, Profile.

---

## 📋 Admin CRM Pages

### Dashboard (/admin)
- Live KPI cards: Total Workforce, Today Punch-ins, Pending Leaves, Work Deliverables, Leads, Active Jobs.
- Live attendance table for today.
- Fast shortcut buttons to all major pages.

### Employee Management (/admin/employees)
- Full employee table with status badge (Pending / Confirmed).
- Credential Setup: Super Admin creates Email + Password per employee.
- Inline dropdown view with all details, leave count, login count.
- Advanced filter panel + Monthly Punch-in & Leave PDF Download.

### Projects & Deliverables (/admin/projects)
- KPI Cards: Total, In Progress, Completed, Planning counts.
- Search & Filters by title, client, tech stack, ID, Category, Status, Priority.
- Table with progress bar, priority badge, quick status dropdown, inline accordion expand.
- Full Create/Edit modal with employee assignment checkboxes.
- Pre-seeded with 3 demo projects (PRJ-101, PRJ-102, PRJ-103).

### Inquiries & Leads (/admin/inquiries)
- View and manage all contact form submissions with status updates.

### Careers & Jobs (/admin/careers)
- Job listings CRUD + Candidate PDF Resume viewer & downloader.

### Blog Articles (/admin/blogs)
- Full CRUD + cover image drag-and-drop uploader. Synced live with public /blog page.

### About Editor (/admin/about)
- Edit company story, mission, stats — live synced with public About page.

---

## 🏢 Employee Portal Pages

### Attendance (/admin/attendance)
- Punch In / Punch Out with timestamp.
- Shows only Punch Out button after clocking in (no double punch-in).

### Daily Work Status (/admin/work-status)
- Upload daily deliverables: project name, task, deliverables URL, notes.
- Full history table.

### Leave Tracker (/admin/leaves)
- Apply for leave with type, dates, reason.
- View history with Pending / Approved / Rejected status.
- Leave balance summary card.

---

## 🔄 Architecture

`
PUBLIC WEBSITE (React) — Home, Services, Blog, Careers, Contact
         |
         v
NODE.JS / EXPRESS (Port 5000)
Routes: auth · employees · attendance · leaves · work-reports · projects
        jobs · applications · inquiries · posts · about · stats
         |                              |
         v                              v
MONGODB DATABASE              MEMORY FALLBACK STORE
Employee · Attendance         (Auto-activated when MongoDB offline)
Leave · WorkReport · Project
Job · Application · Inquiry · Post · About
         |
         v
ADMIN PORTAL — PACES CRM LUXE
Super Admin: Dashboard · Employees · Projects · Inquiries · Careers · Blogs · About
Employee:    Dashboard · Punch In/Out · Work Status · Leaves
`

---

## 📁 Project Structure

`
NEXPROBITE/
├── server/
│   ├── config/db.js
│   ├── middleware/auth.js           # JWT verifyToken
│   ├── models/
│   │   ├── Employee.js · Attendance.js · Leave.js · WorkReport.js · Project.js
│   │   ├── User.js · Job.js · Application.js · Inquiry.js · Post.js · About.js
│   ├── routes/
│   │   ├── authRoutes.js · employeeRoutes.js · attendanceRoutes.js
│   │   ├── leaveRoutes.js · workReportRoutes.js · projectRoutes.js · statsRoutes.js
│   │   └── [jobs, applications, inquiries, posts, about]Routes.js
│   ├── store/memoryStore.js         # In-memory fallback store
│   └── server.js
│
├── src/
│   ├── App.jsx                      # Router + ProtectedRoute + SuperAdminOnlyRoute
│   ├── admin/
│   │   ├── AdminLayout.jsx          # Header, Sidebar, Quick Search, App Grid, Theme toggle
│   │   ├── AdminLogin.jsx           # Dual-tab login (Super Admin + Employee)
│   │   ├── AdminDashboard.jsx       # Live KPI + workforce table
│   │   ├── AdminEmployees.jsx       # Employee CRUD, credentials, PDF export
│   │   ├── AdminProjects.jsx        # Project management with CRUD & filters
│   │   ├── AdminInquiries.jsx · AdminCareers.jsx · AdminBlogs.jsx · AdminAbout.jsx
│   │   └── employee/
│   │       ├── EmpDashboard.jsx · EmpAttendance.jsx · EmpWorkStatus.jsx · EmpLeaves.jsx
│   ├── components/
│   │   └── Nav.jsx · Footer.jsx · Cursor.jsx · Nexi.jsx · PageHero.jsx · Services.jsx
│   ├── pages/
│   │   └── Home.jsx · About.jsx · ServicesIndex.jsx · ServiceDetail.jsx
│   │       Blog.jsx · PostDetail.jsx · Careers.jsx · JobDetail.jsx · JobApply.jsx · Contact.jsx
│   ├── hooks/useSEO.js
│   └── data/content.js · seo.js
│
├── public/robots.txt · sitemap.xml · assets/
├── .env · vite.config.js · package.json
`

---

## 🛠️ Useful Commands

`ash
npm install          # Install dependencies
npm run dev          # Start Vite Frontend (http://localhost:5173)
npm run server       # Start Node.js Backend (http://localhost:5000)
npm run build        # Build production bundle
npm run preview      # Preview production build
node server/seed.js  # Seed initial database records
`

---

## 📜 License

Copyright © 2026 **Nexprobyte Technologies**. All rights reserved.
