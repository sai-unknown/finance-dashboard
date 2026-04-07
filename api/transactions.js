import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
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
      const { amount, category, type, date } = req.body || {};
      const parsedAmount = Number(amount);
      const parsedDate = date ? String(date).split("T")[0] : new Date().toISOString().split("T")[0];

      if (!category || !type || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const result = await pool.query(
        "INSERT INTO transactions (amount, category, type, date) VALUES ($1, $2, $3, $4) RETURNING *",
        [parsedAmount, category, type, parsedDate]
      );

      return res.status(201).json(normalize(result.rows[0]));
    }

    // ✅ UPDATE transaction
    if (req.method === "PUT") {
      if (!txId) return res.status(400).json({ error: "Missing id" });

      const { amount, category, type, date } = req.body || {};
      const parsedAmount = Number(amount);
      const parsedDate = date ? String(date).split("T")[0] : new Date().toISOString().split("T")[0];

      if (!category || !type || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const updated = await pool.query(
        "UPDATE transactions SET amount = $2, category = $3, type = $4, date = $5 WHERE id = $1 RETURNING *",
        [txId, parsedAmount, category, type, parsedDate]
      );

      if (!updated.rows.length) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(normalize(updated.rows[0]));
    }

    // ✅ DELETE transaction
    if (req.method === "DELETE") {
      if (!txId) return res.status(400).json({ error: "Missing id" });
      const deleted = await pool.query(
        "DELETE FROM transactions WHERE id = $1 RETURNING *",
        [txId]
      );
      if (!deleted.rows.length) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(normalize(deleted.rows[0]));
    }

    // ❌ other methods
    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}