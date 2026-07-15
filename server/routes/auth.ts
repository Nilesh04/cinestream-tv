import { Router } from 'express';
import crypto from 'crypto';
import db from '../db';

const router = Router();

function hash(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name || null, email, hash(password));
  res.status(201).json({ id: result.lastInsertRowid, email });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password = ?').get(email, hash(password)) as Record<string, unknown> | undefined;
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json(user);
});

router.put('/profile', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: 'User ID and name required' });
    return;
  }
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id);
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  res.json(user);
});

router.put('/password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  if (!id || !currentPassword || !newPassword) {
    res.status(400).json({ error: 'User ID, current password, and new password required' });
    return;
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ? AND password = ?').get(id, hash(currentPassword)) as Record<string, unknown> | undefined;
  if (!user) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash(newPassword), id);
  res.json({ success: true });
});

export default router;
