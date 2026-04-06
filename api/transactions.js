const { Pool } = require("pg");
const crypto = require("crypto");

let pool;
let schemaReady = false;
let seedTransactions = [];

try {
  // Seed data for first-time deployments.
  // (Only inserted if the table is empty.)
  seedTransactions = require("../db.json").transactions || [];
} catch {
  seedTransactions = [];
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (Neon connection string). Set it in Vercel env vars."
    );
  }
  return url;
}

function getPool() {
  if (pool) return pool;

  // Neon requires TLS; adding rejectUnauthorized:false is the common Vercel/pg setup.
  pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    // Small pool for serverless: avoid too many idle clients.
    max: 5,
  });

  return pool;
}

async function ensureSchema() {
  if (schemaReady) return;
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      amount INTEGER NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL,
      date DATE NOT NULL
    );
  `);

  if (seedTransactions.length) {
    const countRes = await p.query("SELECT COUNT(*) AS count FROM transactions");
    const count = Number(countRes.rows?.[0]?.count ?? 0);

    if (count === 0) {
      for (const t of seedTransactions) {
        await p.query(
          `
            INSERT INTO transactions (id, type, amount, category, date)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [t.id, t.type, t.amount, t.category, t.date]
        );
      }
    }
  }

  schemaReady = true;
}

function parseBodyJson(req) {
  // Some Vercel runtimes may already parse JSON into `req.body`.
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string" && req.body.trim().length > 0) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      // Fall back to stream parsing below.
    }
  }

  return new Promise((resolve, reject) => {
    // Some clients may set Content-Type without sending a body.
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function normalizeTransactionPayload(body) {
  const type = String(body?.type || "").trim().toLowerCase();
  const category = String(body?.category || "").trim();
  const amount = Number(body?.amount);
  const date = String(body?.date || "").trim();

  if (type !== "income" && type !== "expense") {
    return { ok: false, error: 'Type must be "income" or "expense".' };
  }
  if (!category) return { ok: false, error: "Category is required." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be greater than 0." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "Date must be in YYYY-MM-DD format." };
  }

  return {
    ok: true,
    value: {
      type,
      category,
      amount: Math.trunc(amount),
      date,
    },
  };
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  // Vercel serverless functions: no implicit body parser for all runtimes,
  // so we parse manually for non-GET methods.
  try {
    await ensureSchema();
  } catch (err) {
    return sendJson(res, 500, { error: String(err?.message || err) });
  }

  const method = req.method?.toUpperCase();
  const idFromQuery = req.query?.id; // comes from vercel.json rewrite

  try {
    if (method === "GET") {
      const p = getPool();

      if (idFromQuery) {
        const r = await p.query(
          "SELECT id, type, amount, category, date FROM transactions WHERE id = $1 LIMIT 1",
          [idFromQuery]
        );
        if (r.rows.length === 0) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 200, r.rows[0]);
      }

      const r = await getPool().query(
        "SELECT id, type, amount, category, date FROM transactions ORDER BY date ASC, id ASC"
      );
      return sendJson(res, 200, r.rows);
    }

    if (method === "POST") {
      const body = await parseBodyJson(req);
      const normalized = normalizeTransactionPayload(body);
      if (!normalized.ok) return sendJson(res, 400, { error: normalized.error });

      const id = crypto.randomUUID();
      const p = getPool();
      const { type, category, amount, date } = normalized.value;

      await p.query(
        `
          INSERT INTO transactions (id, type, amount, category, date)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [id, type, amount, category, date]
      );

      const created = {
        id,
        type,
        amount,
        category,
        date,
      };

      return sendJson(res, 201, created);
    }

    if (method === "PUT") {
      const body = await parseBodyJson(req);
      const id = idFromQuery || body.id;

      if (!id) return sendJson(res, 400, { error: "Missing id" });
      const normalized = normalizeTransactionPayload(body);
      if (!normalized.ok) return sendJson(res, 400, { error: normalized.error });

      const p = getPool();
      const { type, category, amount, date } = normalized.value;
      const r = await p.query(
        `
          UPDATE transactions
          SET type = $2, amount = $3, category = $4, date = $5
          WHERE id = $1
          RETURNING id, type, amount, category, date
        `,
        [id, type, amount, category, date]
      );

      if (r.rows.length === 0) return sendJson(res, 404, { error: "Not found" });
      return sendJson(res, 200, r.rows[0]);
    }

    if (method === "DELETE") {
      const id = idFromQuery;
      if (!id) return sendJson(res, 400, { error: "Missing id" });

      const p = getPool();
      const r = await p.query(
        `
          DELETE FROM transactions
          WHERE id = $1
          RETURNING id, type, amount, category, date
        `,
        [id]
      );

      if (r.rows.length === 0) return sendJson(res, 404, { error: "Not found" });
      // Frontend only checks `res.ok`, but returning JSON is useful for clients.
      return sendJson(res, 200, r.rows[0]);
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (err) {
    return sendJson(res, 500, { error: String(err?.message || err) });
  }
};

