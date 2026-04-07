import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productName TEXT NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    desc TEXT,
    preco REAL NOT NULL,
    imagem TEXT,
    categoria TEXT NOT NULL,
    subcategoria TEXT NOT NULL,
    popular BOOLEAN DEFAULT 0,
    tags TEXT, -- JSON string array
    ingredientes TEXT, -- JSON string array
    variacoes TEXT, -- JSON search variations
    oculto BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed initial settings if empty
const countSettings = db.prepare('SELECT count(*) as count FROM settings').get() as any;
if (countSettings.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('whatsapp', '5511999999999');
  insertSetting.run('max_reservations', '20');
}

// Seed initial products if empty
const countProducts = db.prepare('SELECT count(*) as count FROM products').get() as any;
if (countProducts.count === 0) {
  const initialProducts = [
    // Comidas - Porções
    { nome: "Porção de batata", desc: "Batatas fritas crocantes e douradas", preco: 25.90, imagem: "https://picsum.photos/seed/fries/400/400", categoria: "comidas", subcategoria: "Porções", popular: 1, tags: ["vegetariano", "fritura"], ingredientes: ["Batata", "Sal", "Óleo vegetal"] },
    { nome: "Porção de filé de tilápia", desc: "Filés frescos empanados e fritos", preco: 45.90, imagem: "https://picsum.photos/seed/friedfish/400/400", categoria: "comidas", subcategoria: "Porções", popular: 1, tags: ["frutos do mar", "fritura"], ingredientes: ["Filé de tilápia", "Farinha de trigo", "Ovo", "Farinha de rosca", "Limão", "Sal"] },
    { nome: "Porção de posta de tilápia", desc: "Postas suculentas com tempero da casa", preco: 39.90, imagem: "https://picsum.photos/seed/fishsteak/400/400", categoria: "comidas", subcategoria: "Porções", popular: 0, tags: ["frutos do mar"], ingredientes: ["Posta de tilápia", "Alho", "Limão", "Sal", "Ervas finas"] },
    { nome: "Porção de bolinho de tilápia com queijo", desc: "Bolinhos artesanais recheados com queijo derretido", preco: 35.90, imagem: "https://picsum.photos/seed/fishcake/400/400", categoria: "comidas", subcategoria: "Porções", popular: 1, tags: ["frutos do mar", "fritura", "queijo"], ingredientes: ["Tilápia desfiada", "Queijo muçarela", "Batata", "Cebola", "Salsa", "Farinha de rosca"] },
    { nome: "Porção de camarão alho e óleo", desc: "Camarões salteados no azeite e alho", preco: 55.90, imagem: "https://picsum.photos/seed/shrimp/400/400", categoria: "comidas", subcategoria: "Porções", popular: 1, tags: ["frutos do mar"], ingredientes: ["Camarão", "Alho", "Azeite de oliva", "Sal", "Salsa"] },
    // Acompanhamentos
    { nome: "Porção de salada", desc: "Mix de folhas frescas, tomate e cebola", preco: 15.90, imagem: "https://picsum.photos/seed/salad/400/400", categoria: "comidas", subcategoria: "Acompanhamentos", popular: 0, tags: ["vegetariano", "saudável"] },
    { nome: "Porção de arroz", desc: "Arroz branco soltinho", preco: 12.90, imagem: "https://picsum.photos/seed/rice/400/400", categoria: "comidas", subcategoria: "Acompanhamentos", popular: 0, tags: ["vegetariano"] },
    { nome: "Porção de pirão de peixe", desc: "Pirão tradicional cremoso e saboroso", preco: 18.90, imagem: "https://picsum.photos/seed/stew/400/400", categoria: "comidas", subcategoria: "Acompanhamentos", popular: 0, tags: ["frutos do mar"] },
    // Bebidas - Energéticos
    { nome: "Red Bull", desc: "Lata 250ml", preco: 15.00, imagem: "https://picsum.photos/seed/energy1/400/400", categoria: "bebidas", subcategoria: "Energéticos", popular: 0, tags: ["sem álcool", "energético"] },
    { nome: "Monster", desc: "Lata 473ml", preco: 18.00, imagem: "https://picsum.photos/seed/energy2/400/400", categoria: "bebidas", subcategoria: "Energéticos", popular: 0, tags: ["sem álcool", "energético"] },
    // Vinhos
    { nome: "Malbec Argentino", desc: "Aromas intensos de ameixa e baunilha, taninos macios. Mendoza, Argentina.", preco: 145.00, imagem: "https://picsum.photos/seed/winemalbec/400/400", categoria: "bebidas", subcategoria: "Vinhos", popular: 1, tags: ["com álcool", "vinho", "tinto"] },
    { nome: "Heineken 600ml", desc: "Garrafa 600ml bem gelada", preco: 18.90, imagem: "https://picsum.photos/seed/beer1/400/400", categoria: "bebidas", subcategoria: "Cervejas", popular: 1, tags: ["com álcool", "cerveja"] }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (id, nome, desc, preco, imagem, categoria, subcategoria, popular, tags, ingredientes, variacoes, oculto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  initialProducts.forEach(p => {
    const id = Math.random().toString(36).substr(2, 9);
    insertProduct.run(
      id, p.nome, p.desc || '', p.preco, p.imagem || '', p.categoria, p.subcategoria, 
      p.popular, JSON.stringify(p.tags || []), JSON.stringify(p.ingredientes || []),
      JSON.stringify([]), 0
    );
  });
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes - Reviews
  app.get('/api/reviews', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM reviews ORDER BY date DESC');
      const allReviews = stmt.all();
      
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
      
      res.status(201).json({ id, productName: product, author, rating, comment, date });
    } catch (error) {
      console.error('Error saving review:', error);
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  // API Routes - Products
  app.get('/api/products', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM products');
      const products = stmt.all().map((p: any) => ({
        ...p,
        popular: p.popular === 1,
        oculto: p.oculto === 1,
        tags: JSON.parse(p.tags || '[]'),
        ingredientes: JSON.parse(p.ingredientes || '[]'),
        variacoes: JSON.parse(p.variacoes || '[]')
      }));
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', (req, res) => {
    const p = req.body;
    const id = p.id || Math.random().toString(36).substr(2, 9);
    
    try {
      const stmt = db.prepare(`
        INSERT INTO products (id, nome, desc, preco, imagem, categoria, subcategoria, popular, tags, ingredientes, variacoes, oculto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id, p.nome, p.desc || '', p.preco, p.imagem || '', p.categoria, p.subcategoria, 
        p.popular ? 1 : 0, JSON.stringify(p.tags || []), JSON.stringify(p.ingredientes || []),
        JSON.stringify(p.variacoes || []), p.oculto ? 1 : 0
      );
      
      res.status(201).json({ ...p, id });
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const p = req.body;
    
    try {
      const stmt = db.prepare(`
        UPDATE products 
        SET nome = ?, desc = ?, preco = ?, imagem = ?, categoria = ?, subcategoria = ?, popular = ?, tags = ?, ingredientes = ?, variacoes = ?, oculto = ?
        WHERE id = ?
      `);
      
      stmt.run(
        p.nome, p.desc || '', p.preco, p.imagem || '', p.categoria, p.subcategoria, 
        p.popular ? 1 : 0, JSON.stringify(p.tags || []), JSON.stringify(p.ingredientes || []),
        JSON.stringify(p.variacoes || []), p.oculto ? 1 : 0, id
      );
      
      res.json({ ...p, id });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare('DELETE FROM products WHERE id = ?');
      stmt.run(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // API Routes - Settings
  app.get('/api/settings', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM settings');
      const settings = stmt.all().reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', (req, res) => {
    const settings = req.body;
    try {
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(settings)) {
        stmt.run(key, String(value));
      }
      res.json({ message: 'Settings updated' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
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

