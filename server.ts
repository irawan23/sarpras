import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("sarpras.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT CHECK(role IN ('admin', 'operator', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    pic_name TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT,
    category TEXT CHECK(category IN ('umum', 'tanah', 'bangunan')),
    brand TEXT,
    specification TEXT,
    year_acquired INTEGER,
    source_fund TEXT,
    price REAL,
    condition TEXT CHECK(condition IN ('baik', 'rusak_ringan', 'rusak_berat')),
    status TEXT DEFAULT 'aktif', -- aktif, non-aktif
    room_id INTEGER,
    pic_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS mutations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    from_room_id INTEGER,
    to_room_id INTEGER,
    mutation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    operator_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (from_room_id) REFERENCES rooms(id),
    FOREIGN KEY (to_room_id) REFERENCES rooms(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS procurement_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    quantity INTEGER,
    estimated_price REAL,
    purpose TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
    requester_id INTEGER,
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stock_opname (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    condition_before TEXT,
    condition_after TEXT,
    notes TEXT,
    operator_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
  );
`);

// Seed initial admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)").run(
    "admin",
    "admin123",
    "Administrator Utama",
    "admin"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, name, role FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Inventory API
  app.get("/api/inventory", (req, res) => {
    const { category, status } = req.query;
    let query = "SELECT i.*, r.name as room_name FROM inventory_items i LEFT JOIN rooms r ON i.room_id = r.id";
    const params = [];
    
    const conditions = [];
    if (category) {
      conditions.push("i.category = ?");
      params.push(category);
    }
    if (status) {
      conditions.push("i.status = ?");
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    const items = db.prepare(query).all(...params);
    res.json(items);
  });

  app.post("/api/inventory", (req, res) => {
    const { barcode, name, category, brand, specification, year_acquired, source_fund, price, condition, room_id, pic_name, notes } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO inventory_items (barcode, name, category, brand, specification, year_acquired, source_fund, price, condition, room_id, pic_name, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(barcode, name, category, brand, specification, year_acquired, source_fund, price, condition, room_id, pic_name, notes);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { name, brand, specification, condition, status, room_id, pic_name, notes } = req.body;
    db.prepare(`
      UPDATE inventory_items 
      SET name = ?, brand = ?, specification = ?, condition = ?, status = ?, room_id = ?, pic_name = ?, notes = ?
      WHERE id = ?
    `).run(name, brand, specification, condition, status, room_id, pic_name, notes, id);
    res.json({ success: true });
  });

  // Rooms API
  app.get("/api/rooms", (req, res) => {
    const rooms = db.prepare("SELECT * FROM rooms").all();
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { code, name, pic_name, description } = req.body;
    const result = db.prepare("INSERT INTO rooms (code, name, pic_name, description) VALUES (?, ?, ?, ?)").run(code, name, pic_name, description);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  // Mutations API
  app.get("/api/mutations", (req, res) => {
    const mutations = db.prepare(`
      SELECT m.*, i.name as item_name, i.barcode, r1.name as from_room_name, r2.name as to_room_name, u.name as operator_name
      FROM mutations m
      JOIN inventory_items i ON m.item_id = i.id
      JOIN rooms r1 ON m.from_room_id = r1.id
      JOIN rooms r2 ON m.to_room_id = r2.id
      JOIN users u ON m.operator_id = u.id
      ORDER BY m.mutation_date DESC
    `).all();
    res.json(mutations);
  });

  app.post("/api/mutations", (req, res) => {
    const { item_id, to_room_id, reason, operator_id } = req.body;
    const item = db.prepare("SELECT room_id FROM inventory_items WHERE id = ?").get(item_id);
    
    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO mutations (item_id, from_room_id, to_room_id, reason, operator_id) VALUES (?, ?, ?, ?, ?)")
        .run(item_id, item.room_id, to_room_id, reason, operator_id);
      db.prepare("UPDATE inventory_items SET room_id = ? WHERE id = ?").run(to_room_id, item_id);
    });
    
    transaction();
    res.json({ success: true });
  });

  // Procurement API
  app.get("/api/procurement", (req, res) => {
    const requests = db.prepare(`
      SELECT p.*, u.name as requester_name 
      FROM procurement_requests p 
      JOIN users u ON p.requester_id = u.id
    `).all();
    res.json(requests);
  });

  app.post("/api/procurement", (req, res) => {
    const { item_name, quantity, estimated_price, purpose, requester_id } = req.body;
    const result = db.prepare("INSERT INTO procurement_requests (item_name, quantity, estimated_price, purpose, requester_id) VALUES (?, ?, ?, ?, ?)")
      .run(item_name, quantity, estimated_price, purpose, requester_id);
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.patch("/api/procurement/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE procurement_requests SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // Stock Opname API
  app.get("/api/opname", (req, res) => {
    const history = db.prepare(`
      SELECT o.*, i.name as item_name, i.barcode, u.name as operator_name
      FROM stock_opname o
      JOIN inventory_items i ON o.item_id = i.id
      JOIN users u ON o.operator_id = u.id
      ORDER BY o.check_date DESC
    `).all();
    res.json(history);
  });

  app.post("/api/opname", (req, res) => {
    const { item_id, condition_after, notes, operator_id } = req.body;
    const item = db.prepare("SELECT condition FROM inventory_items WHERE id = ?").get(item_id);
    
    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO stock_opname (item_id, condition_before, condition_after, notes, operator_id) VALUES (?, ?, ?, ?, ?)")
        .run(item_id, item.condition, condition_after, notes, operator_id);
      db.prepare("UPDATE inventory_items SET condition = ? WHERE id = ?").run(condition_after, item_id);
    });
    
    transaction();
    res.json({ success: true });
  });

  // Reports API
  app.get("/api/reports/summary", (req, res) => {
    const summary = {
      total_items: db.prepare("SELECT COUNT(*) as count FROM inventory_items WHERE status = 'aktif'").get().count,
      total_land: db.prepare("SELECT COUNT(*) as count FROM inventory_items WHERE category = 'tanah' AND status = 'aktif'").get().count,
      total_building: db.prepare("SELECT COUNT(*) as count FROM inventory_items WHERE category = 'bangunan' AND status = 'aktif'").get().count,
      total_damaged: db.prepare("SELECT COUNT(*) as count FROM inventory_items WHERE condition != 'baik' AND status = 'aktif'").get().count,
      procurement_pending: db.prepare("SELECT COUNT(*) as count FROM procurement_requests WHERE status = 'pending'").get().count,
    };
    res.json(summary);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
