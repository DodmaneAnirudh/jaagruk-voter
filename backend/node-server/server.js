// backend/server.js
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = "CHANGE_THIS_SECRET_KEY";

app.use(cors());
app.use(express.json());

// ----------------------------
// 1. INIT SQLITE (better-sqlite3)
// ----------------------------
const DB_PATH = path.join(__dirname, "jaagrukvoter.db");
const db = new Database(DB_PATH);

// Create tables
db.prepare(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
)`
).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS logins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  is_guest INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL,
  ip TEXT
)`
).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  language TEXT,
  type TEXT,
  timestamp TEXT NOT NULL,
  ip TEXT
)`
).run();

// ----------------------------
// 2. SEED DEFAULT ADMIN
// ----------------------------
const ADMIN_EMAIL = "ani123@gmail.com";
const ADMIN_PASSWORD = "123456789";

const existingAdmin = db.prepare(
  "SELECT * FROM admins WHERE email = ?"
).get(ADMIN_EMAIL);

if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare(
    "INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)"
  ).run(ADMIN_EMAIL, hash, new Date().toISOString());
  console.log("Admin created:", ADMIN_EMAIL);
} else {
  console.log("Admin already exists:", ADMIN_EMAIL);
}

// ----------------------------
// 3. MIDDLEWARE
// ----------------------------
function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ----------------------------
// 4. GENERAL
// ----------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running with better-sqlite3" });
});

// ----------------------------
// 5. LOGIN (USER & GUEST)
// ----------------------------
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: "Email required" });

  db.prepare(
    "INSERT INTO logins (email, is_guest, timestamp, ip) VALUES (?, ?, ?, ?)"
  ).run(email.trim(), 0, new Date().toISOString(), req.ip);

  res.json({ status: "ok" });
});

app.post("/api/login-guest", (req, res) => {
  db.prepare(
    "INSERT INTO logins (email, is_guest, timestamp, ip) VALUES (?, ?, ?, ?)"
  ).run("guest@anonymous", 1, new Date().toISOString(), req.ip);

  res.json({ status: "ok" });
});

// ----------------------------
// 6. SEARCH HISTORY
// ----------------------------
app.post("/api/search-history", (req, res) => {
  const { query, language = "", type = "" } = req.body;

  if (!query?.trim()) return res.status(400).json({ error: "Query required" });

  const result = db.prepare(`
    INSERT INTO search_history (query, language, type, timestamp, ip)
    VALUES (?, ?, ?, ?, ?)
  `).run(query.trim(), language, type, new Date().toISOString(), req.ip);

  res.json({ status: "ok", id: result.lastInsertRowid });
});

// ----------------------------
// 7. ADMIN LOGIN
// ----------------------------
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ status: "ok", token });
});

// ----------------------------
// 8. ADMIN DATA + ANALYTICS
// ----------------------------
app.get("/api/admin/logins", authAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, email, is_guest, timestamp, ip
    FROM logins
    ORDER BY timestamp DESC
    LIMIT 200
  `).all();

  res.json({ entries: rows });
});

app.get("/api/admin/search-history", authAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, query, language, type, timestamp, ip
    FROM search_history
    ORDER BY timestamp DESC
    LIMIT 200
  `).all();

  res.json({ entries: rows });
});

app.delete("/api/admin/logins/:id", authAdmin, (req, res) => {
  db.prepare("DELETE FROM logins WHERE id = ?").run(req.params.id);
  res.json({ status: "ok" });
});

app.delete("/api/admin/search-history/:id", authAdmin, (req, res) => {
  db.prepare("DELETE FROM search_history WHERE id = ?").run(req.params.id);
  res.json({ status: "ok" });
});

// -------- Analytics --------
app.get("/api/admin/stats", authAdmin, (req, res) => {
  const guestBreakdown = db.prepare(`
    SELECT is_guest AS guest, COUNT(*) AS count
    FROM logins GROUP BY is_guest
  `).all();

  const loginsPerDay = db.prepare(`
    SELECT DATE(timestamp) AS day, COUNT(*) AS count
    FROM logins GROUP BY DATE(timestamp)
  `).all();

  const topQueries = db.prepare(`
    SELECT query, COUNT(*) AS count
    FROM search_history GROUP BY query
    ORDER BY count DESC LIMIT 5
  `).all();

  res.json({ guestBreakdown, loginsPerDay, topQueries });
});

// ----------------------------
// 9. START SERVER
// ----------------------------
app.listen(PORT, () => {
  console.log("Backend running on port:", PORT);
});
