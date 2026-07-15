import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) {
    res.json([]);
    return;
  }

  const pattern = `%${q}%`;
  const movies = db.prepare(`
    SELECT * FROM movies
    WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
    ORDER BY
      CASE
        WHEN title LIKE ? THEN 0
        WHEN category LIKE ? THEN 1
        ELSE 2
      END,
      title
    LIMIT 20
  `).all(pattern, pattern, pattern, pattern, pattern);

  res.json(movies);
});

export default router;
