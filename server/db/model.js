import { query as runQuery } from "../config/db.js";
import { TABLES, isJsonColumn } from "./schema.js";

// ─────────────────────────────────────────────────────────────
// Small MongoDB/Mongoose-style query engine backed by PostgreSQL.
// Supports the exact subset of operations the route files use:
//   find().sort().lean(), findOne, findById, create,
//   findOneAndUpdate (incl. $set + upsert), findByIdAndUpdate,
//   findOneAndDelete, findByIdAndDelete, countDocuments,
//   and document.save() on returned rows.
// ─────────────────────────────────────────────────────────────

function columnsFor(table) {
  return new Set(TABLES[table].columns.map((c) => c.name));
}

function hasColumn(table, col) {
  return TABLES[table].columns.some((c) => c.name === col);
}

function idPrefixFor(table) {
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

function generateId(table) {
  return `${idPrefixFor(table)}-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;
}

function encodeValue(table, col, value) {
  if (value === undefined || value === null) return value;
  if (isJsonColumn(table, col)) return JSON.stringify(value);
  return value;
}

// Build a WHERE clause from a mongoose-style filter object.
// Appends bound parameters to the shared `params` array.
function buildWhere(table, query, params) {
  const conds = [];
  for (const [key, value] of Object.entries(query || {})) {
    if (key === "$or") {
      const orConds = [];
      for (const sub of value) {
        orConds.push(buildWhere(table, sub, params));
      }
      conds.push(`(${orConds.join(" OR ")})`);
    } else {
      conds.push(condSql(table, key, value, params));
    }
  }
  return conds.length ? conds.join(" AND ") : "TRUE";
}

function condSql(table, col, value, params) {
  if (value instanceof RegExp) {
    params.push(value.source);
    return `"${col}" ${value.flags.includes("i") ? "~*" : "~"} $${params.length}`;
  }
  if (value === null) return "FALSE";
  if (Array.isArray(value)) {
    params.push(value.map((v) => encodeValue(table, col, v)));
    return `"${col}" = ANY($${params.length})`;
  }
  params.push(encodeValue(table, col, value));
  return `"${col}" = $${params.length}`;
}

function sortSql(table, sort) {
  if (!sort) return "";
  const parts = Object.entries(sort)
    .filter(([col]) => hasColumn(table, col))
    .map(([col, dir]) => `"${col}" ${Number(dir) < 0 ? "DESC" : "ASC"}`);
  return parts.length ? ` ORDER BY ${parts.join(", ")}` : "";
}

function rowToDoc(table, row) {
  if (!row) return null;
  const doc = { ...row };
  Object.defineProperty(doc, "save", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: async function save() {
      const cols = [...columnsFor(table)];
      const sets = [];
      const vals = [];
      for (const col of cols) {
        if (col === "_id") continue;
        if (this[col] === undefined) continue;
        if (col === "updatedAt") continue; // always refreshed below
        vals.push(encodeValue(table, col, this[col]));
        sets.push(`"${col}" = $${vals.length}`);
      }
      vals.push(new Date().toISOString());
      sets.push(`"updatedAt" = $${vals.length}`);
      vals.push(this._id);
      await runQuery(
        `UPDATE "${table}" SET ${sets.join(", ")} WHERE "_id" = $${vals.length}`,
        vals
      );
      this.updatedAt = new Date();
      return this;
    },
  });
  return doc;
}

function applyProjection(doc, projection) {
  if (!projection) return doc;
  const out = {};
  for (const [field, flag] of Object.entries(projection)) {
    if (flag === 1) out[field] = doc[field];
  }
  return out;
}

function model(table) {
  const api = {};

  api.find = function find(query = {}, projection = null) {
    const chain = {
      _sort: null,
      _limit: null,
      _proj: projection,
      sort(spec) {
        this._sort = spec;
        return this;
      },
      limit(n) {
        this._limit = n;
        return this;
      },
      lean() {
        return this;
      },
      then(onFulfilled, onRejected) {
        return this.exec().then(onFulfilled, onRejected);
      },
      async exec() {
        const params = [];
        const where = buildWhere(table, query, params);
        let sql = `SELECT * FROM "${table}"`;
        if (where !== "TRUE") sql += ` WHERE ${where}`;
        sql += sortSql(table, this._sort);
        if (this._limit) sql += ` LIMIT ${this._limit}`;
        const res = await runQuery(sql, params);
        if (this._proj) {
          return (res.rows || []).map((r) => applyProjection(r, this._proj));
        }
        return (res.rows || []).map((r) => rowToDoc(table, r));
      },
    };
    return chain;
  };

  api.findOne = async function findOne(query = {}) {
    const params = [];
    const where = buildWhere(table, query, params);
    let sql = `SELECT * FROM "${table}"`;
    if (where !== "TRUE") sql += ` WHERE ${where}`;
    sql += ` ORDER BY "createdAt" ASC LIMIT 1`;
    const res = await runQuery(sql, params);
    return rowToDoc(table, res.rows[0]);
  };

  api.findById = async function findById(id) {
    return api.findOne({ _id: id });
  };

  api.create = async function create(doc = {}) {
    const cols = [...columnsFor(table)];
    const row = { ...doc };
    if (!row._id) row._id = generateId(table);
    if (row.createdAt === undefined) row.createdAt = new Date().toISOString();
    if (row.updatedAt === undefined) row.updatedAt = new Date().toISOString();

    const colNames = [];
    const colVals = [];
    for (const col of cols) {
      if (row[col] === undefined) continue;
      colNames.push(`"${col}"`);
      colVals.push(encodeValue(table, col, row[col]));
    }
    if (colNames.length === 0) throw new Error("No fields to insert.");

    const placeholders = colVals.map((_, i) => `$${i + 1}`).join(", ");
    const onConflict = cols
      .filter((c) => c !== "_id")
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .join(", ");
    const res = await runQuery(
      `INSERT INTO "${table}" (${colNames.join(", ")}) VALUES (${placeholders})
       ON CONFLICT ("_id") DO UPDATE SET ${onConflict} RETURNING *`,
      colVals
    );
    return rowToDoc(table, res.rows[0]);
  };

  async function mutateUpdate(query, update, opts = {}) {
    const params = [];
    const where = buildWhere(table, query, params);
    const patch = update && update.$set ? update.$set : update || {};
    const sets = [];
    for (const [col, value] of Object.entries(patch)) {
      if (!hasColumn(table, col) || col === "_id") continue;
      if (value === undefined) continue;
      params.push(encodeValue(table, col, value));
      sets.push(`"${col}" = $${params.length}`);
    }
    if (sets.length === 0) sets.push(`"updatedAt" = "updatedAt"`);

    let sql = `UPDATE "${table}" SET ${sets.join(", ")}`;
    if (where !== "TRUE") sql += ` WHERE ${where}`;
    sql += ` RETURNING *`;

    const res = await runQuery(sql, params);
    if (res.rows[0]) {
      const doc = rowToDoc(table, res.rows[0]);
      // keep response shape consistent with { new: true }
      return opts.new === false ? null : doc;
    }

    if (opts.upsert) {
      // Merge equality fields from the query into the insert payload so
      // upsert behaves like Mongoose (e.g. seed.js admin upsert).
      const merged = {};
      for (const [col, value] of Object.entries(query || {})) {
        if (col === "$or" || value === null) continue;
        if (value instanceof RegExp || Array.isArray(value)) continue;
        if (hasColumn(table, col)) merged[col] = value;
      }
      Object.assign(merged, patch);
      const created = await api.create(merged);
      return created;
    }

    return null;
  }

  api.findOneAndUpdate = async function findOneAndUpdate(query, update, opts = {}) {
    return mutateUpdate(query, update, opts);
  };

  api.findByIdAndUpdate = async function findByIdAndUpdate(id, update, opts = {}) {
    return mutateUpdate({ _id: id }, update, opts);
  };

  api.findOneAndDelete = async function findOneAndDelete(query = {}) {
    const params = [];
    const where = buildWhere(table, query, params);
    let sql = `DELETE FROM "${table}"`;
    if (where !== "TRUE") sql += ` WHERE ${where}`;
    sql += ` RETURNING *`;
    const res = await runQuery(sql, params);
    return rowToDoc(table, res.rows[0]) || null;
  };

  api.findByIdAndDelete = async function findByIdAndDelete(id) {
    return api.findOneAndDelete({ _id: id });
  };

  api.countDocuments = async function countDocuments(query = {}) {
    const params = [];
    const where = buildWhere(table, query, params);
    let sql = `SELECT count(*)::int AS c FROM "${table}"`;
    if (where !== "TRUE") sql += ` WHERE ${where}`;
    const res = await runQuery(sql, params);
    return (res.rows[0] || {}).c || 0;
  };

  api.distinct = async function distinct(field, query = {}) {
    const params = [];
    const where = buildWhere(table, query, params);
    let sql = `SELECT DISTINCT "${field}" FROM "${table}"`;
    if (where !== "TRUE") sql += ` WHERE ${where}`;
    const res = await runQuery(sql, params);
    return (res.rows || []).map((r) => r[field]).filter((v) => v != null);
  };

  return api;
}

export function defineModel(table) {
  return model(table);
}