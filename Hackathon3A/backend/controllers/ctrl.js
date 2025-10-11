
exports.info = (req, res) => {
  const db = req.app.get('db');
  const { name, score } = req.body;

  if (!name || score === undefined) {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  db.run('INSERT INTO users (name, score) VALUES (?, ?)', [name, score], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, score });
  });
};

exports.connexion = (req, res) => {
  const db = req.app.get('db');

  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

