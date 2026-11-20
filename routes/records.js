const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

// Runs for every route that has :id. Checks the id is a positive whole number.
router.param("id", (req, res, next, value) => {
  if (!/^[1-9][0-9]*$/.test(value)) {
    return res.status(400).json({ message: "Id must be a positive whole number." });
  }
  const id = Number(value);
  if (id > 2147483647) {
    return res.status(404).json({ message: "Record not found." });
  }
  req.recordId = id;
  next();
});

// Checks and trims the four editable fields. Returns { error } or { value }.
function checkBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }
  const clean = {};
  for (const field of ["title", "category", "description", "status"]) {
    if (typeof body[field] !== "string") {
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      return { error: label + " is required and must be text." };
    }
    clean[field] = body[field].trim();
  }
  if (clean.title.length < 3 || clean.title.length > 80) {
    return { error: "Title must have 3 to 80 characters." };
  }
  if (clean.category.length < 2 || clean.category.length > 40) {
    return { error: "Category must have 2 to 40 characters." };
  }
  if (clean.description.length < 5 || clean.description.length > 300) {
    return { error: "Description must have 5 to 300 characters." };
  }
  if (!STATUSES.includes(clean.status)) {
    return { error: "Status must be Pending, In progress or Completed." };
  }
  return { value: clean };
}

// GET all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status " +
      "FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET one record
router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status " +
      "FROM records WHERE id = $1",
      [req.recordId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create a record (any id sent by the client is ignored)
router.post("/", async (req, res, next) => {
  try {
    const checked = checkBody(req.body);
    if (checked.error) {
      return res.status(400).json({ message: checked.error });
    }
    const r = checked.value;
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
      "VALUES ($1, $2, $3, $4) RETURNING *",
      [r.title, r.category, r.description, r.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT replace the four editable fields of an existing record
router.put("/:id", async (req, res, next) => {
  try {
    const checked = checkBody(req.body);
    if (checked.error) {
      return res.status(400).json({ message: checked.error });
    }
    const r = checked.value;
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
      "WHERE id = $5 RETURNING *",
      [r.title, r.category, r.description, r.status, req.recordId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE a record
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [req.recordId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
