import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('reviews.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productName TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/reviews', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM reviews ORDER BY date DESC');
      const allReviews = stmt.all();
      
      // Group by product name
      const groupedReviews: Record<string, any[]> = {};
      for (const review of allReviews as any[]) {
        if (!groupedReviews[review.productName]) {
          groupedReviews[review.productName] = [];
        }
        groupedReviews[review.productName].push(review);
      }
      
      res.json(groupedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews/:product', (req, res) => {
    const { product } = req.params;
    const { author, rating, comment } = req.body;
    
    if (!author || !rating) {
      return res.status(400).json({ error: 'Author and rating are required' });
    }

    const id = Math.random().toString(36).substr(2, 9);
    const date = new Date().toISOString();

    try {
      const stmt = db.prepare(`
        INSERT INTO reviews (id, productName, author, rating, comment, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(id, product, author, rating, comment || '', date);
      
      res.status(201).json({
        id,
        productName: product,
        author,
        rating,
        comment,
        date
      });
    } catch (error) {
      console.error('Error saving review:', error);
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
