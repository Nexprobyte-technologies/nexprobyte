import { query } from "../config/db.js";
import { memoryStore } from "../store/memoryStore.js";

// Column type keywords
const T = {
  text: "TEXT",
  bool: "BOOLEAN",
  int: "INTEGER",
  num: "DOUBLE PRECISION",
  json: "JSONB",
  ts: "TIMESTAMPTZ",
};

// Central definition of every table and its columns.
// Column JSON parse hints: values stored as JSONB come back as objects/arrays.
export const TABLES = {
  users: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "username", type: T.text },
      { name: "password", type: T.text },
      { name: "name", type: T.text },
      { name: "role", type: T.text },
      { name: "email", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  employees: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "empId", type: T.text },
      { name: "name", type: T.text },
      { name: "email", type: T.text },
      { name: "password", type: T.text },
      { name: "phone", type: T.text },
      { name: "department", type: T.text },
      { name: "designation", type: T.text },
      { name: "joiningDate", type: T.text },
      { name: "status", type: T.text },
      { name: "avatar", type: T.text },
      { name: "role", type: T.text },
      { name: "leaveBalance", type: T.json },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  attendances: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "employeeId", type: T.text },
      { name: "employeeName", type: T.text },
      { name: "date", type: T.text },
      { name: "clockIn", type: T.text },
      { name: "clockOut", type: T.text },
      { name: "totalHours", type: T.text },
      { name: "status", type: T.text },
      { name: "notes", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  workreports: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "employeeId", type: T.text },
      { name: "employeeName", type: T.text },
      { name: "date", type: T.text },
      { name: "projectTitle", type: T.text },
      { name: "hoursSpent", type: T.num },
      { name: "taskDetails", type: T.text },
      { name: "blockers", type: T.text },
      { name: "status", type: T.text },
      { name: "link", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  leaves: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "employeeId", type: T.text },
      { name: "employeeName", type: T.text },
      { name: "leaveType", type: T.text },
      { name: "fromDate", type: T.text },
      { name: "toDate", type: T.text },
      { name: "days", type: T.int },
      { name: "reason", type: T.text },
      { name: "status", type: T.text },
      { name: "adminRemark", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  jobs: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "slug", type: T.text },
      { name: "title", type: T.text },
      { name: "dept", type: T.text },
      { name: "location", type: T.text },
      { name: "type", type: T.text },
      { name: "salary", type: T.text },
      { name: "palette", type: T.text },
      { name: "excerpt", type: T.text },
      { name: "responsibilities", type: T.json },
      { name: "requirements", type: T.json },
      { name: "active", type: T.bool },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  applications: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "jobId", type: T.text },
      { name: "jobTitle", type: T.text },
      { name: "name", type: T.text },
      { name: "email", type: T.text },
      { name: "phone", type: T.text },
      { name: "experience", type: T.text },
      { name: "portfolioUrl", type: T.text },
      { name: "linkedinUrl", type: T.text },
      { name: "coverLetter", type: T.text },
      { name: "resumeFileName", type: T.text },
      { name: "resumeData", type: T.text },
      { name: "resumeSize", type: T.text },
      { name: "status", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  inquiries: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "name", type: T.text },
      { name: "email", type: T.text },
      { name: "phone", type: T.text },
      { name: "organization", type: T.text },
      { name: "service", type: T.text },
      { name: "message", type: T.text },
      { name: "status", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  posts: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "slug", type: T.text },
      { name: "title", type: T.text },
      { name: "category", type: T.text },
      { name: "date", type: T.text },
      { name: "read", type: T.text },
      { name: "palette", type: T.text },
      { name: "excerpt", type: T.text },
      { name: "image", type: T.text },
      { name: "content", type: T.json },
      { name: "author", type: T.text },
      { name: "published", type: T.bool },
      { name: "views", type: T.int },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  abouts: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "eyebrow", type: T.text },
      { name: "title", type: T.text },
      { name: "subtitle", type: T.text },
      { name: "story", type: T.text },
      { name: "mission", type: T.text },
      { name: "vision", type: T.text },
      { name: "stats", type: T.json },
      { name: "values", type: T.json },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  expenses: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "date", type: T.text },
      { name: "category", type: T.text },
      { name: "to", type: T.text },
      { name: "reason", type: T.text },
      { name: "amount", type: T.num },
      { name: "type", type: T.text },
      { name: "note", type: T.text },
      { name: "recordedByName", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  interviewdatas: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "name", type: T.text },
      { name: "dob", type: T.text },
      { name: "email", type: T.text },
      { name: "address", type: T.text },
      { name: "experienceType", type: T.text },
      { name: "experienceYears", type: T.text },
      { name: "resumeFileName", type: T.text },
      { name: "resumeData", type: T.text },
      { name: "resumeSize", type: T.text },
      { name: "status", type: T.text },
      { name: "onboarding", type: T.json },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  quotations: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "quoteNo", type: T.text },
      { name: "quoteType", type: T.text },
      { name: "date", type: T.text },
      { name: "partyName", type: T.text },
      { name: "partyCompany", type: T.text },
      { name: "partyEmail", type: T.text },
      { name: "partyPhone", type: T.text },
      { name: "partyAddress", type: T.text },
      { name: "title", type: T.text },
      { name: "description", type: T.text },
      { name: "items", type: T.json },
      { name: "subTotal", type: T.num },
      { name: "taxAmount", type: T.num },
      { name: "discount", type: T.num },
      { name: "taxRate", type: T.num },
      { name: "grandTotal", type: T.num },
      { name: "terms", type: T.json },
      { name: "notes", type: T.text },
      { name: "status", type: T.text },
      { name: "imageName", type: T.text },
      { name: "imageData", type: T.text },
      { name: "createdBy", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
  projects: {
    columns: [
      { name: "_id", type: T.text, primary: true },
      { name: "projectId", type: T.text },
      { name: "title", type: T.text },
      { name: "clientName", type: T.text },
      { name: "clientEmail", type: T.text },
      { name: "category", type: T.text },
      { name: "description", type: T.text },
      { name: "assignedEmployees", type: T.json },
      { name: "startDate", type: T.text },
      { name: "deadline", type: T.text },
      { name: "budget", type: T.text },
      { name: "priority", type: T.text },
      { name: "status", type: T.text },
      { name: "progress", type: T.int },
      { name: "techStack", type: T.json },
      { name: "deliverablesUrl", type: T.text },
      { name: "notes", type: T.text },
      { name: "createdAt", type: T.ts },
      { name: "updatedAt", type: T.ts },
    ],
  },
};

const jsonColumnsByTable = {};
for (const [table, def] of Object.entries(TABLES)) {
  jsonColumnsByTable[table] = new Set(
    def.columns.filter((c) => c.type === T.json).map((c) => c.name)
  );
}

export const isJsonColumn = (table, col) =>
  jsonColumnsByTable[table] ? jsonColumnsByTable[table].has(col) : false;

export async function initSchema() {
  for (const [table, def] of Object.entries(TABLES)) {
    const colDefs = def.columns
      .map((c) => {
        let line = `"${c.name}" ${c.type}`;
        if (c.primary) line += " PRIMARY KEY";
        return line;
      })
      .join(",\n  ");
    await query(`CREATE TABLE IF NOT EXISTS "${table}" (${colDefs})`);

    // Self-healing: add any missing columns introduced after the table was first created
    for (const c of def.columns) {
      if (c.primary) continue;
      await query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${c.name}" ${c.type}`
      );
    }
  }
  console.log(`[PostgreSQL Schema]: ${Object.keys(TABLES).length} tables ready`);
}

// Pre-encode values so JSONB columns get proper JSON and timestamps stay strings
function encodeValue(table, col, value) {
  if (value === undefined || value === null) return value;
  if (isJsonColumn(table, col)) return JSON.stringify(value);
  return value;
}

export async function primeDatabase() {
  const collections = [
    "expenses",
    "inquiries",
    "applications",
    "jobs",
    "posts",
    "employees",
    "attendance",
    "workReports",
    "leaves",
    "interviewData",
    "projects",
    "quotations",
  ];

  for (const key of collections) {
    const data = memoryStore[key];
    if (!Array.isArray(data) || data.length === 0) continue;
    const table = tableForStoreKey(key);
    const count = await rowCount(table);
    if (count > 0) continue; // never overwrite existing data

    for (const item of data) {
      await insertRow(table, item);
    }
    console.log(`[PostgreSQL Seed]: ${data.length} rows → ${table}`);
  }

  // Single-row 'about' document
  if (memoryStore.about) {
    const count = await rowCount("abouts");
    if (count === 0) {
      await insertRow("abouts", memoryStore.about);
      console.log("[PostgreSQL Seed]: 1 row → abouts");
    }
  }
}

function tableForStoreKey(key) {
  switch (key) {
    case "expenses": return "expenses";
    case "inquiries": return "inquiries";
    case "applications": return "applications";
    case "jobs": return "jobs";
    case "posts": return "posts";
    case "employees": return "employees";
    case "attendance": return "attendances";
    case "workReports": return "workreports";
    case "leaves": return "leaves";
    case "interviewData": return "interviewdatas";
    case "projects": return "projects";
    case "quotations": return "quotations";
    default: return key;
  }
}

async function rowCount(table) {
  const res = await query(`SELECT count(*)::int AS c FROM "${table}"`);
  return (res.rows[0] || {}).c || 0;
}

async function insertRow(table, item) {
  const def = TABLES[table];
  const validCols = new Set(def.columns.map((c) => c.name));
  const overwrite = {
    _id: item._id || `${idPrefix(table)}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };

  const colNames = [];
  const colVals = [];
  for (const col of validCols) {
    if (col === "_id") {
      colNames.push(`"_id"`);
      colVals.push(overwrite._id);
      continue;
    }
    const value = item[col];
    if (value === undefined) {
      if (col === "createdAt") {
        colNames.push(`"createdAt"`);
        colVals.push(overwrite.createdAt);
      } else if (col === "updatedAt") {
        colNames.push(`"updatedAt"`);
        colVals.push(overwrite.updatedAt);
      }
      continue;
    }
    colNames.push(`"${col}"`);
    colVals.push(encodeValue(table, col, value));
  }

  const placeholders = colVals.map((_, i) => `$${i + 1}`).join(", ");
  await query(
    `INSERT INTO "${table}" (${colNames.join(", ")}) VALUES (${placeholders}) ON CONFLICT ("_id") DO NOTHING`,
    colVals
  );
}

function idPrefix(table) {
  switch (table) {
    case "users": return "usr";
    case "employees": return "emp";
    case "attendances": return "att";
    case "workreports": return "wrp";
    case "leaves": return "lve";
    case "jobs": return "job";
    case "applications": return "app";
    case "inquiries": return "inq";
    case "posts": return "pst";
    case "abouts": return "abt";
    case "expenses": return "exp";
    case "interviewdatas": return "ivw";
    case "projects": return "prj";
    case "quotations": return "qtn";
    default: return "row";
  }
}