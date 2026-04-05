/** Parse one CSV line with optional double-quoted fields */
export function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ",") {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += c;
  }
  result.push(current.trim());
  return result;
}

function isValidISODate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

/**
 * Parse CSV text. Expected header: type,amount,category,date (any column order).
 * @returns {{ ok: boolean, rows: object[], errors: string[] }}
 */
export function parseTransactionsCSV(text) {
  const errors = [];
  const raw = text.trim();
  if (!raw) {
    return { ok: false, rows: [], errors: ["File is empty."] };
  }

  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      ok: false,
      rows: [],
      errors: ["CSV needs a header row and at least one data row."],
    };
  }

  const headerCells = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const col = {
    type: headerCells.indexOf("type"),
    amount: headerCells.indexOf("amount"),
    category: headerCells.indexOf("category"),
    date: headerCells.indexOf("date"),
  };

  if (
    col.type === -1 ||
    col.amount === -1 ||
    col.category === -1 ||
    col.date === -1
  ) {
    return {
      ok: false,
      rows: [],
      errors: [
        'First row must be headers: type, amount, category, date (any order).',
      ],
    };
  }

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const cells = parseCSVLine(lines[i]);
    const typeRaw = (cells[col.type] || "").trim().toLowerCase();
    const amountRaw = (cells[col.amount] || "").trim();
    const category = (cells[col.category] || "").trim();
    const dateStr = (cells[col.date] || "").trim();

    if (!typeRaw || !amountRaw || !category || !dateStr) {
      errors.push(`Line ${lineNum}: missing type, amount, category, or date.`);
      continue;
    }

    if (typeRaw !== "income" && typeRaw !== "expense") {
      errors.push(
        `Line ${lineNum}: type must be "income" or "expense" (got "${typeRaw}").`
      );
      continue;
    }

    const amount = Number(amountRaw.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Line ${lineNum}: amount must be a number greater than 0.`);
      continue;
    }

    if (!isValidISODate(dateStr)) {
      errors.push(
        `Line ${lineNum}: date must be YYYY-MM-DD (got "${dateStr}").`
      );
      continue;
    }

    rows.push({
      type: typeRaw,
      amount,
      category,
      date: dateStr,
    });
  }

  if (errors.length > 0) {
    return { ok: false, rows: [], errors };
  }

  return { ok: true, rows, errors: [] };
}
