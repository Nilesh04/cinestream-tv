import express from 'express';
import cors from 'cors';
import db from './db';
import moviesRouter from './routes/movies';
import searchRouter from './routes/search';
import authRouter from './routes/auth';
import faqRouter from './routes/faq';
import favoritesRouter from './routes/favorites';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors());
app.use(express.json());

app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/auth', authRouter);
app.use('/api/faq', faqRouter);
app.use('/api/favorites', favoritesRouter);

app.get('/api/categories', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM movies ORDER BY category').all() as { category: string }[];
  res.json(rows.map(r => r.category));
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
