const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Create the table if it doesn’t exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
  )
`);

// POST endpoint to add a user and score
app.post('/submit', (req, res) => {
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  db.run('INSERT INTO users (name, score) VALUES (?, ?)', [name, score], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, score });
  });
});

// GET endpoint to list all users
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
