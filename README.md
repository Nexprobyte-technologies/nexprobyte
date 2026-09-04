# NEXPROBYTE — Digital Solutions Portal & Admin CRM System

Official full-stack web application for **Nexprobyte Technologies**, a Coimbatore-based digital solutions agency. Includes a high-performance React public website and a comprehensive Paces CRM Luxe Admin Portal powered by a Node.js + Express REST API with MongoDB (plus automatic memory fallback storage).

---

## ⚡ Tech Stack Summary

| Component | Layer | Technology / Libraries |
| --- | --- | --- |
| **Frontend** | Framework | React 18 + Vite |
| | Routing | React Router v7 |
| | Animation | Framer Motion (`motion/react`) + GSAP + ScrollTrigger |
| | Styling | Custom CSS (`styles.css`, `styles-pages.css`, `admin-styles.css`) |
| **Backend** | Runtime | Node.js + Express |
| | Database | MongoDB + Mongoose (with active Memory Fallback Store) |
| | Auth | JSON Web Token (JWT) + bcryptjs |
| | Environment | `dotenv`, `cors`, `body-parser` (25MB payload limit for PDF uploads) |

---

## 🚀 How to Run (ReactJS + NodeJS + MongoDB)

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Optional: If MongoDB is running at `mongodb://127.0.0.1:27017/nexprobyte`, the server connects automatically. If MongoDB is offline, the backend automatically uses the built-in **Memory Fallback Store** so all features work seamlessly without failing).

---

### Step 1: Install Dependencies
```bash
npm install
```

---

### Step 2: Configure Environment Variables
A `.env` file is located in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nexprobyte
JWT_SECRET=nexprobyte_secret_key_2026
```

---

### Step 3: Run the Application

You will run the **Backend Server (Node.js)** and **Frontend App (React.js)** in two separate terminal windows:

#### 🟢 Terminal 1: Start Backend Node.js Server
```bash
npm run server
```
- Server starts at: **`http://localhost:5000`**
- Connects to MongoDB or initializes Memory Store.
- Exposes REST API endpoints (`/api/auth`, `/api/jobs`, `/api/applications`, `/api/inquiries`, `/api/posts`, `/api/about`).

#### 🔵 Terminal 2: Start Frontend React App (Vite)
```bash
npm run dev
```
- Frontend app starts at: **`http://localhost:5173`**
- Proxies `/api` requests to `http://localhost:5000`.

---

### Step 4: Access Admin Panel & Public Website
- **Public Website**: [http://localhost:5173](http://localhost:5173)
- **Job Application Page**: [http://localhost:5173/careers/frontend-developer/apply](http://localhost:5173/careers/frontend-developer/apply)
- **Admin Portal Login**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
  - **Username**: `NexAdmin`
  - **Password**: `Nex@.1A`

---

## 🔄 End-to-End Code Flow & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PUBLIC WEBSITE (REACT)                            │
│  Home (/) • Services (/services) • Blog (/blog) • Careers (/careers/apply)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST Requests (JSON / Base64)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NODE.JS / EXPRESS BACKEND                          │
│           server/server.js (Port 5000) · CORS · JWT Verification            │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │ MongoDB Connected                   │ Offline / Fallback
                    ▼                                     ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────────┐
│         MONGODB DATABASE             │ │       MEMORY FALLBACK STORE        │
│ User · Job · Application · Inquiry   │ │  In-Memory Objects & Arrays        │
│ Post · About (Mongoose Schemas)      │ │  (Instant Zero-Downtime Guarantee) │
└───────────────────┬──────────────────┘ └─────────────────┬──────────────────┘
                    │                                      │
                    └──────────────────┬───────────────────┘
                                       │ JWT Auth Check
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ADMIN PORTAL (PACES CRM LUXE)                         │
│  Dashboard (/admin) • Inquiries • Careers & PDFs • Blogs • About Editor     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Directory Breakdown

```
NEXPROBITE/
├── server/                      # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection handler
│   ├── models/
│   │   ├── User.js              # Admin credentials schema
│   │   ├── Job.js               # Job listings schema
│   │   ├── Application.js       # Candidate applications & PDF schema
│   │   ├── Inquiry.js           # Contact form leads schema
│   │   ├── Post.js              # Blog articles schema
│   │   └── About.js             # About page content schema
│   ├── seed.js                  # Database initial seeder script
│   └── server.js                # Main Express REST API server (Port 5000)
│
├── src/                         # React Frontend (Vite)
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # React Router routes & ProtectedRoute guard
│   ├── styles.css               # Global theme & cursor styles
│   ├── styles-pages.css         # Public website page styles
│   │
│   ├── admin/                   # Admin Portal (Paces CRM Luxe Theme)
│   │   ├── admin-styles.css     # Admin Light & Dark theme CSS variables
│   │   ├── AdminLayout.jsx      # Header, Sidebar, Quick Search, Theme toggle
│   │   ├── AdminLogin.jsx       # Admin Auth Login (/admin/login)
│   │   ├── AdminDashboard.jsx   # Metrics, stats, recent leads
│   │   ├── AdminInquiries.jsx   # Leads management & status updating
│   │   ├── AdminCareers.jsx     # Job CRUD & Candidate PDF Resume viewer/downloader
│   │   ├── AdminBlogs.jsx       # Blog post CRUD & Cover image uploader
│   │   └── AdminAbout.jsx       # About page editor
│   │
│   ├── components/              # Public reusable UI components
│   │   ├── Nav.jsx              # Navbar with logo & dropdowns
│   │   ├── Footer.jsx           # Footer with logo & links
│   │   ├── Cursor.jsx           # Custom interactive cursor
│   │   ├── Nexi.jsx             # AI Chat Assistant (Voice + WhatsApp)
│   │   ├── PageHero.jsx         # Interior page hero banners
│   │   ├── Services.jsx         # "What We Do" service cards with hover thumbnails
│   │   └── Reveal.jsx / CTA.jsx # Scroll animations
│   │
│   ├── pages/                   # Public Pages
│   │   ├── Home.jsx             # Landing page
│   │   ├── About.jsx            # About page (syncs with backend API)
│   │   ├── ServicesIndex.jsx    # Services listing
│   │   ├── ServiceDetail.jsx    # Single service view
│   │   ├── Blog.jsx             # Blog post list (syncs with backend API)
│   │   ├── PostDetail.jsx       # Single blog post view
│   │   ├── Careers.jsx          # Job listings with tech stack icon badges
│   │   ├── JobDetail.jsx        # Job description view
│   │   ├── JobApply.jsx         # Candidate Application Form (PDF Upload & Validation)
│   │   └── Contact.jsx          # Contact inquiry form
│   │
│   └── data/
│       └── content.js           # Initial fallback content data
│
├── public/                      # Static assets & images
│   └── assets/                  # Logos and uploaded media assets
├── .env                         # Environment variables
├── vite.config.js               # Vite config with API proxy to localhost:5000
└── package.json                 # Scripts & dependencies
```

---

## 🛠️ Detailed Feature & Code Flow Breakdown

### 1. Candidate Job Application Flow (`/careers/apply` & `/careers/:slug/apply`)
1. User clicks **"Apply for this role"** on any job card.
2. `JobApply.jsx` loads available job roles from `GET /api/jobs` and pre-selects the clicked role in the dropdown.
3. Form performs real-time validations:
   - **Full Name**: Required (min 2 chars).
   - **Email**: RFC email regex validation.
   - **Phone**: Required (min 10 digits).
   - **Resume PDF**: Validates `.pdf` extension and file size limit (**Max 5MB**). Converts the PDF to Base64 data string via `FileReader`.
4. Form sends payload to `POST /api/applications`.
5. Backend (`server/server.js`) saves the record into MongoDB `Application` collection (or `memoryStore.applications`).
6. Candidate receives instant success card feedback.
7. Admin can view the submission at `/admin/careers` inside the inline expandable dropdown table row, preview the PDF directly inside an embedded iframe, or click **"⬇️ Download PDF"**.

---

### 2. Admin Portal Core Systems (`/admin/*`)
- **Authentication Guard**: `ProtectedRoute` checks `localStorage.getItem("nex_admin_token")`. Unauthenticated requests are redirected to `/admin/login`.
- **Header Tools (`AdminLayout.jsx`)**:
  - **Quick Search**: Real-time popover search indexing Pages, Leads, and Jobs.
  - **Theme Toggle (☀️ / 🌙)**: Switches between Light and Dark mode using custom CSS variables (`--p-header-bg`, `--p-sidebar-bg`, `--p-content-bg`).
  - **Apps Grid Menu (⊞)**: Quick shortcuts dropdown.
  - **Notification Center (🔔)**: Unread badges & notifications.
  - **Admin Settings (⚙️)**: Change admin profile, password, or reload system cache.
- **Candidate Applications & Resume PDF (`AdminCareers.jsx`)**:
  - Tabbed interface between Job Openings and Candidate Applications.
  - **Inline Dropdown View (`View Details ▾`)**: Expands full candidate profile, experience, links, cover note, and **interactive embedded PDF resume preview + direct download button**.
- **Blog Article Management (`AdminBlogs.jsx`)**:
  - Full CRUD operations for blog posts.
  - **Cover Image Uploader**: Drag & drop or browse image file (JPG, PNG, WEBP, GIF, SVG). Converts file to Base64 data URL for database storage.
  - **Frontend Connection**: Live articles automatically sync with `src/pages/Blog.jsx` and `src/pages/PostDetail.jsx`.

---

## 🔑 Useful Commands

```bash
# Install dependencies
npm install

# Start Vite Frontend Dev Server (http://localhost:5173)
npm run dev

# Start Node.js Backend Server (http://localhost:5000)
npm run server

# Seed initial database records
node server/seed.js

# Build production bundle to dist/
npm run build

# Preview production build
npm run preview
```

---

## 📜 License

Copyright © 2026 **Nexprobyte Technologies**. All rights reserved.
# nexprobyte
