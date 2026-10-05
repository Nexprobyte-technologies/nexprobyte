import pg from "pg";
import net from "net";
import { initSchema, primeDatabase } from "../db/schema.js";

const { Pool } = pg;

let pool = null;

// Connection string can be overridden via PG_URI / DATABASE_URL.
// Defaults to a local PostgreSQL instance on port 5432.
const DEFAULT_PG_URI =
  process.env.DATABASE_URL ||
  process.env.PG_URI ||
  "postgres://postgres:postgres@localhost:5432/nexprobyte";

function parsePgUri(uri = DEFAULT_PG_URI) {
  try {
    const url = new URL(uri);
    const isSocket = url.protocol === "postgresql:" || url.protocol === "postgres:";
    if (!isSocket) return null;
    return {
      host: url.hostname || "localhost",
      port: parseInt(url.port || "5432", 10),
    };
  } catch {
    return null;
  }
}

function checkPortOpen(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.on("connect", () => {
      status = true;
      socket.destroy();
    });
    socket.on("timeout", () => {
      socket.destroy();
    });
    socket.on("error", () => {
      socket.destroy();
    });
    socket.on("close", () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

export async function connectDB() {
  // Fast TCP check to avoid hanging the event loop if Postgres is offline
  try {
    const parts = parsePgUri();
    if (parts) {
      const isOpen = await checkPortOpen(parts.host, parts.port, 800);
      if (!isOpen) {
        console.warn(
          `[PostgreSQL Warning]: Could not connect to PostgreSQL at ${DEFAULT_PG_URI}. Fallback storage active.`
        );
        return false;
      }
    }
  } catch (e) {
    // Fallback if parsing fails
  }

  try {
    pool = new Pool({
      connectionString: DEFAULT_PG_URI,
      connectionTimeoutMillis: 3000,
      max: 20,
    });

    // Verify connectivity
    const client = await pool.connect();
    client.release();

    // Ensure schema exists
    await initSchema();

    // Preserve existing in-repo data (memoryStore) into PostgreSQL if tables are empty
    await primeDatabase();

    console.log(`[PostgreSQL Connected]: ${DEFAULT_PG_URI}`);
    return true;
  } catch (err) {
    try {
      if (pool) await pool.end();
    } catch (e) {
      // ignore cleanup errors
    }
    pool = null;
    console.warn(
      `[PostgreSQL Warning]: Could not connect to PostgreSQL (${err.message}). Fallback storage active.`
    );
    return false;
  }
}

export function getPool() {
  return pool;
}

// Lightweight query helper used by the model layer
export async function query(text, params = []) {
  if (!pool) throw new Error("Database not connected.");
  const result = await pool.query(text, params);
  return result;
}