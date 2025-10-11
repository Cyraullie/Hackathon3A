const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const routes= require('./routes/routes')
const PORT = 3000;
const cors = require('cors');
app.use(cors()); // allow all origins (OK for dev)
// Middleware to parse JSON
app.use(express.json()); 
app.use('/', routes);
app.use(express.static('frontend')) // i changed public to frontend
// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});
app.set('db', db);
// Create the table if it doesn’t exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
  )
`);

// POST endpoint to add a user and score
app.post('/info', (req, res) => {
  const db = req.app.get('db');
  console.log(req.body)
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
app.get('/connexion', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

