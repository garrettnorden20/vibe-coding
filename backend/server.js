const express = require('express');
const { v4: uuidv4 } = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pins (
    id TEXT PRIMARY KEY,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    message TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  )`);
});

function pruneOldPins() {
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  db.run('DELETE FROM pins WHERE created_at < ?', cutoff);
}

app.get('/pins', (req, res) => {
  const { lat, lng, radius = 5 } = req.query;
  if (!lat || !lng) return res.json([]);
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  db.all(
    'SELECT * FROM pins WHERE created_at >= ? AND abs(lat-?) <= 0.1 AND abs(lng-?) <= 0.1',
    [cutoff, lat, lng],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/pins', (req, res) => {
  const { lat, lng, message } = req.body;
  if (!lat || !lng || !message) return res.status(400).json({ error: 'Invalid pin' });
  const sanitized = String(message).slice(0, 200);
  const id = uuidv4();
  const ts = Math.floor(Date.now() / 1000);
  db.run(
    'INSERT INTO pins (id, lat, lng, message, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, Number(lat), Number(lng), sanitized, ts],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id });
    }
  );
});

app.listen(3000, () => {
  console.log('VibeMap backend listening on port 3000');
  pruneOldPins();
  setInterval(pruneOldPins, 3600 * 1000);
});
