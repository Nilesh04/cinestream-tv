import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const { category, mediaType } = req.query;
  let sql = 'SELECT * FROM movies WHERE 1=1';
  const params: unknown[] = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (mediaType) {
    sql += ' AND media_type = ?';
    params.push(mediaType);
  }

  sql += ' ORDER BY id';

  const movies = db.prepare(sql).all(...params);
  res.json(movies);
});

router.get('/:id', (req, res) => {
  const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!movie) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const episodes = db.prepare('SELECT * FROM episodes WHERE movie_id = ? ORDER BY episode_number').all(req.params.id);
  res.json({ ...movie, episodes });
});

router.get('/:id/episodes', (req, res) => {
  const episodes = db.prepare('SELECT * FROM episodes WHERE movie_id = ? ORDER BY episode_number').all(req.params.id);
  res.json(episodes);
});

export default router;
