import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let schemaReady = false;
const rateWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const rateMax = Number(process.env.RATE_LIMIT_MAX || 120);
const ipHits = new Map();

async function ensureSchema() {
  if (schemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      date DATE NOT NULL
    );
  `);
  schemaReady = true;
}

function parseAndValidate(body = {}) {
  const type = String(body.type || "").trim().toLowerCase();
  const category = String(body.category || "").trim();
  const amount = Number(body.amount);
  const date = String(body.date || "").trim();

  if (type !== "income" && type !== "expense") {
    return { ok: false, error: 'type must be "income" or "expense"' };
  }
  if (!category || category.length > 100) {
    return { ok: false, error: "category is required and must be <= 100 chars" };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000_000) {
    return { ok: false, error: "amount must be > 0 and <= 1,000,000,000,000" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "date must be YYYY-MM-DD" };
  }

  return {
    ok: true,
    value: {
      type,
      category,
      amount: Number(amount.toFixed(2)),
      date,
    },
  };
}

function isWriteMethod(method) {
  return method === "POST" || method === "PUT" || method === "DELETE";
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(req) {
  const key = `${getClientIp(req)}:${req.method || "UNKNOWN"}`;
  const now = Date.now();
  const current = ipHits.get(key);
  if (!current || now - current.windowStart > rateWindowMs) {
    ipHits.set(key, { windowStart: now, count: 1 });
    return false;
  }
  current.count += 1;
  ipHits.set(key, current);
  return current.count > rateMax;
}

function isAuthorizedWrite(req) {
  const required = process.env.ADMIN_WRITE_TOKEN;
  if (!required) return true; // Optional hardening: enable by setting ADMIN_WRITE_TOKEN.
  const provided = req.headers["x-admin-token"];
  return typeof provided === "string" && provided === required;
}

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "Missing DATABASE_URL" });
    }

    if (isRateLimited(req)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    if (isWriteMethod(req.method) && !isAuthorizedWrite(req)) {
      return res.status(401).json({ error: "Unauthorized write operation" });
    }

    await ensureSchema();
    const txId = req.query?.id;

    const normalize = (row) => ({
      ...row,
      amount: Number(row.amount) || 0,
      date: row.date ? String(row.date).split("T")[0] : "",
    });

    // ✅ GET all transactions / one transaction
    if (req.method === "GET") {
      if (txId) {
        const one = await pool.query(
          "SELECT * FROM transactions WHERE id = $1 LIMIT 1",
          [txId]
        );
        if (!one.rows.length) {
          return res.status(404).json({ error: "Not found" });
        }
        return res.status(200).json(normalize(one.rows[0]));
      }

      const result = await pool.query("SELECT * FROM transactions ORDER BY date DESC");
      return res.status(200).json(result.rows.map(normalize));
    }

    // ✅ ADD transaction
    if (req.method === "POST") {
      const parsed = parseAndValidate(req.body);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });

      const result = await pool.query(
        "INSERT INTO transactions (amount, category, type, date) VALUES ($1, $2, $3, $4) RETURNING *",
        [parsed.value.amount, parsed.value.category, parsed.value.type, parsed.value.date]
      );

      return res.status(201).json(normalize(result.rows[0]));
    }

    // ✅ UPDATE transaction
    if (req.method === "PUT") {
      if (!txId) return res.status(400).json({ error: "Missing id" });
      if (!/^\d+$/.test(String(txId))) {
        return res.status(400).json({ error: "Invalid id" });
      }
      const parsed = parseAndValidate(req.body);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });

      const updated = await pool.query(
        "UPDATE transactions SET amount = $2, category = $3, type = $4, date = $5 WHERE id = $1 RETURNING *",
        [txId, parsed.value.amount, parsed.value.category, parsed.value.type, parsed.value.date]
      );

      if (!updated.rows.length) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(normalize(updated.rows[0]));
    }

    // ✅ DELETE transaction
    if (req.method === "DELETE") {
      if (!txId) return res.status(400).json({ error: "Missing id" });
      if (!/^\d+$/.test(String(txId))) {
        return res.status(400).json({ error: "Invalid id" });
      }
      const deleted = await pool.query(
        "DELETE FROM transactions WHERE id = $1 RETURNING *",
        [txId]
      );
      if (!deleted.rows.length) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(normalize(deleted.rows[0]));
    }

    // ❌ other methods
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}