require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Stops the server from crashing if the database closes an idle connection
pool.on("error", (error) => {
  console.error("Unexpected database error:", error.message);
});

module.exports = pool;
