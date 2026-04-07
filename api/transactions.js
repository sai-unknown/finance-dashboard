import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  try {
    // ✅ GET all transactions
    if (req.method === "GET") {
      const result = await pool.query(
        "SELECT * FROM transactions ORDER BY date DESC"
      );
      return res.status(200).json(result.rows);
    }

    // ✅ ADD transaction
    if (req.method === "POST") {
      const { amount, category, type } = req.body;

      const result = await pool.query(
        "INSERT INTO transactions (amount, category, type) VALUES ($1, $2, $3) RETURNING *",
        [amount, category, type]
      );

      return res.status(201).json(result.rows[0]);
    }

    // ❌ other methods
    return res.status(405).json({ message: "Method not allowed" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}