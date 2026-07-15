import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: 'userId query parameter required' });
    return;
  }
  const rows = db.prepare('SELECT movie_id FROM favorites WHERE user_id = ?').all(Number(userId)) as { movie_id: number }[];
  res.json(rows.map(r => r.movie_id));
});

router.post('/:movieId', (req, res) => {
  const { userId } = req.body;
  const movieId = Number(req.params.movieId);
  if (!userId || !movieId) {
    res.status(400).json({ error: 'userId and movieId required' });
    return;
  }
  try {
    db.prepare('INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)').run(userId, movieId);
    res.status(201).json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error && 'code' in e && (e as { code: string }).code === 'SQLITE_CONSTRAINT_FOREIGNKEY'
      ? 'User or movie not found'
      : 'Already favorited';
    console.error('POST /api/favorites/:movieId:', msg, e);
    res.status(409).json({ error: msg });
  }
});

router.delete('/:movieId', (req, res) => {
  const userId = req.query.userId as string;
  const movieId = Number(req.params.movieId);
  if (!userId || !movieId) {
    res.status(400).json({ error: 'userId and movieId required' });
    return;
  }
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND movie_id = ?').run(Number(userId), movieId);
  res.json({ success: true });
});

export default router;
