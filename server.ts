import express from 'express';
// dynamic import used later
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = process.cwd();

// Supabase Setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

let supabase: any;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} catch (e) {
  console.error("Supabase init error:", e);
}

const app = express();
app.use(express.json());

// Add debug route to intercept missing keys
app.use((req, res, next) => {
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return res.status(500).json({ 
      error: 'Vercel Env Vars Missing!',
      keys_found: Object.keys(process.env).filter(k => k.includes('VITE') || k.includes('SUPABASE'))
    });
  }
  next();
});

// ============================================
// API Routes - Reviews
// ============================================
app.get('/api/reviews', async (req, res) => {
  const { data, error } = await supabase.from('reviews').select('*').order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  
  const groupedReviews: Record<string, any[]> = {};
  for (const review of data || []) {
    if (!groupedReviews[review.productName]) groupedReviews[review.productName] = [];
    groupedReviews[review.productName].push(review);
  }
  res.json(groupedReviews);
});

app.post('/api/reviews/:product', async (req, res) => {
  const { product } = req.params;
  const { author, rating, comment } = req.body;
  if (!author || !rating) return res.status(400).json({ error: 'Author and rating are required' });

  const { data, error } = await supabase.from('reviews').insert([{
    productName: product, author, rating, comment: comment || '', date: new Date().toISOString()
  }]).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ============================================
// API Routes - Products
// ============================================
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/products', async (req, res) => {
  const p = req.body;
  const { data, error } = await supabase.from('products').insert([{
    nome: p.nome,
    desc: p.desc || '',
    preco: p.preco,
    imagem: p.imagem || '',
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    popular: p.popular ? true : false,
    tags: p.tags || [],
    ingredientes: p.ingredientes || [],
    variacoes: p.variacoes || [],
    oculto: p.oculto ? true : false,
    destaque: p.destaque ? true : false,
    preco_promocional: p.preco_promocional || null,
    destaque_label: p.destaque_label || ''
  }]).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  
  const { data, error } = await supabase.from('products').update({
    nome: p.nome,
    desc: p.desc || '',
    preco: p.preco,
    imagem: p.imagem || '',
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    popular: p.popular ? true : false,
    tags: p.tags || [],
    ingredientes: p.ingredientes || [],
    variacoes: p.variacoes || [],
    oculto: p.oculto ? true : false,
    destaque: p.destaque ? true : false,
    preco_promocional: p.preco_promocional || null,
    destaque_label: p.destaque_label || ''
  }).eq('id', id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/products/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

app.post('/api/products-bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'IDs array required' });
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// ============================================
// API Routes - Settings
// ============================================
app.get('/api/settings', async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  const settings = (data || []).reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  res.json(settings);
});

app.put('/api/settings', async (req, res) => {
  const settings = req.body;
  const entries = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
  
  const { error } = await supabase.from('settings').upsert(entries);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Settings updated' });
});

// ============================================
// API Routes - App Users
// ============================================
app.get('/api/app-users', async (req, res) => {
  const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/app-users/:id', async (req, res) => {
  const { data, error } = await supabase.from('app_users').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

app.post('/api/app-users/register', async (req, res) => {
  const { id, email, nome, role } = req.body;
  const { data, error } = await supabase.from('app_users').upsert([
    { id, email, role: role || 'estoque', nome: nome || '' }
  ]).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/app-users', async (req, res) => {
  const { email, password, nome, role } = req.body;
  
  // Creates user directly in Supabase Auth using Service Key
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) return res.status(400).json({ error: authError.message });
  
  const id = authData.user.id;
  const { data, error: dbError } = await supabase.from('app_users').insert([
    { id, email, role: role || 'estoque', nome: nome || '' }
  ]).select().single();

  if (dbError) return res.status(500).json({ error: dbError.message });
  res.status(201).json(data);
});

app.put('/api/app-users/:id', async (req, res) => {
  const { role, nome } = req.body;
  const updates: any = {};
  if (role) updates.role = role;
  if (nome !== undefined) updates.nome = nome;
  
  const { data, error } = await supabase.from('app_users').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/app-users/:id', async (req, res) => {
  const id = req.params.id;
  await supabase.auth.admin.deleteUser(id); // Delete from auth
  await supabase.from('app_users').delete().eq('id', id); // Cascade handles this but doing it explicitly
  res.status(204).end();
});

// ============================================
// API Routes - Stock Control
// ============================================
app.get('/api/stock', async (req, res) => {
  const week = req.query.week as string;
  let query = supabase.from('stock_entries').select('*');
  if (week) query = query.eq('week_start', week);
  else query = query.order('updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/stock', async (req, res) => {
  const { product_id, week_start, urgency, quantity_estimate, notes, updated_by } = req.body;
  
  // Check if exists
  const { data: existing } = await supabase.from('stock_entries')
    .select('id').eq('product_id', product_id).eq('week_start', week_start).single();
    
  if (existing) {
    const { data, error } = await supabase.from('stock_entries').update({
      urgency: urgency || 'ok', quantity_estimate: quantity_estimate || null, notes: notes || '', updated_by: updated_by || '', updated_at: new Date().toISOString()
    }).eq('id', existing.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  const { data, error } = await supabase.from('stock_entries').insert([{
    product_id, week_start, urgency: urgency || 'ok', quantity_estimate: quantity_estimate || null, notes: notes || '', updated_by: updated_by || ''
  }]).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/stock/:id', async (req, res) => {
  const { urgency, quantity_estimate, notes, updated_by } = req.body;
  const { data, error } = await supabase.from('stock_entries').update({
    urgency: urgency || 'ok', quantity_estimate: quantity_estimate || null, notes: notes || '', updated_by: updated_by || '', updated_at: new Date().toISOString()
  }).eq('id', req.params.id).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/stock/deduct', async (req, res) => {
  const { items, source } = req.body; // items: { product_id, quantity }[]
  
  // Helper to get week start (Monday)
  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };
  
  const current_week = getWeekStart();
  const results = [];

  for (const item of items) {
    const { product_id, quantity } = item;
    if (!product_id) continue;

    // Check if exists for this week
    const { data: existing } = await supabase.from('stock_entries')
      .select('*')
      .eq('product_id', product_id)
      .eq('week_start', current_week)
      .single();

    if (existing) {
      const newQty = (existing.quantity_estimate || 0) - quantity;
      const { data, error } = await supabase.from('stock_entries')
        .update({ 
          quantity_estimate: newQty, 
          updated_at: new Date().toISOString(), 
          updated_by: source || 'Sistema' 
        })
        .eq('id', existing.id)
        .select().single();
      results.push({ product_id, success: !error });
    } else {
      const { data, error } = await supabase.from('stock_entries').insert([{
        product_id,
        week_start: current_week,
        quantity_estimate: -quantity,
        urgency: 'ok',
        updated_by: source || 'Sistema'
      }]).select().single();
      results.push({ product_id, success: !error });
    }
  }

  res.json({ success: true, results });
});

// ============================================
// API Routes - Employees
// ============================================
app.get('/api/employees', async (req, res) => {
  const { data, error } = await supabase.from('employees').select('*').order('nome', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/employees', async (req, res) => {
  const { nome } = req.body;
  const { data, error } = await supabase.from('employees').insert([{ nome, ativo: true }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/employees/:id', async (req, res) => {
  const { nome, ativo } = req.body;
  const updates: any = {};
  if (nome !== undefined) updates.nome = nome;
  if (ativo !== undefined) updates.ativo = ativo;
  
  const { data, error } = await supabase.from('employees').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/employees/:id', async (req, res) => {
  const { error } = await supabase.from('employees').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// ============================================
// API Routes - Employee Consumption
// ============================================
app.get('/api/employee-consumption', async (req, res) => {
  const { data, error } = await supabase
    .from('employee_consumption')
    .select('*, employees:employee_id(nome), products:product_id(nome, preco)')
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  
  // Flatten response to match old SQLite format
  const formatted = data.map((d: any) => ({
    ...d,
    employee_nome: d.employees?.nome,
    product_nome: d.products?.nome,
    product_preco: d.products?.preco,
    employees: undefined,
    products: undefined
  }));
  res.json(formatted);
});

app.post('/api/employee-consumption', async (req, res) => {
  const { employee_id, product_id, quantidade, registrado_por } = req.body;
  const dataString = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase.from('employee_consumption').insert([{
    employee_id, product_id, quantidade: quantidade || 1, data: dataString, registrado_por: registrado_por || ''
  }]).select('*, employees:employee_id(nome), products:product_id(nome, preco)').single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = {
    ...data,
    employee_nome: data.employees?.nome,
    product_nome: data.products?.nome,
    product_preco: data.products?.preco,
    employees: undefined,
    products: undefined
  };
  
  res.status(201).json(formatted);
});

app.delete('/api/employee-consumption/:id', async (req, res) => {
  const { error } = await supabase.from('employee_consumption').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// Export the app for Vercel Serverless
export default app;

// Run Vite locally if not in production
if (process.env.NODE_ENV !== 'production') {
  async function startServer() {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(3000, '0.0.0.0', () => {
      console.log('Server running on http://localhost:3000');
    });
  }
  startServer();
} else {
  // If run as a node script in production
  app.use(express.static(path.join(__dirname, 'dist')));
// Local running is handled via "npm run dev" or export over Vercel natively.
}

