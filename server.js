import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MOCK_CATEGORIES = [
  { id: 1, name: 'Burgers' },
  { id: 2, name: 'Drinks' },
  { id: 3, name: 'Sides' },
  { id: 4, name: 'Desserts' }
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Classic Beef Burger', price: 8.99, category_id: 1, category_name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', stock_level: 50 },
  { id: 2, name: 'Double Cheeseburger', price: 11.49, category_id: 1, category_name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5', stock_level: 40 },
  { id: 3, name: 'Spicy Chicken Burger', price: 9.49, category_id: 1, category_name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f', stock_level: 30 },
  { id: 4, name: 'Veggie Garden Burger', price: 10.99, category_id: 1, category_name: 'Burgers', image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360', stock_level: 25 },
  { id: 5, name: 'Iced Coffee', price: 3.50, category_id: 2, category_name: 'Drinks', image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c', stock_level: 100 },
  { id: 6, name: 'Fresh Lemonade', price: 2.99, category_id: 2, category_name: 'Drinks', image_url: 'https://images.unsplash.com/photo-1523362622745-127bbd8b2844', stock_level: 80 },
  { id: 7, name: 'Chocolate Milkshake', price: 4.99, category_id: 2, category_name: 'Drinks', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', stock_level: 45 },
  { id: 8, name: 'French Fries', price: 3.99, category_id: 3, category_name: 'Sides', image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d', stock_level: 200 },
  { id: 9, name: 'Onion Rings', price: 4.49, category_id: 3, category_name: 'Sides', image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d', stock_level: 120 },
  { id: 10, name: 'Caesar Salad', price: 7.49, category_id: 3, category_name: 'Sides', image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9', stock_level: 60 },
  { id: 11, name: 'New York Cheesecake', price: 5.99, category_id: 4, category_name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', stock_level: 30 },
  { id: 12, name: 'Chocolate Lava Cake', price: 6.49, category_id: 4, category_name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51', stock_level: 25 },
  { id: 13, name: 'Apple Pie', price: 4.99, category_id: 4, category_name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2', stock_level: 20 }
];

// Mock sales data for Manager and Staff
let sales = [
  { 
    id: 'TRX-V8S9A1K2L', 
    user_id: 100, 
    items: [{ product_id: 1, name: 'Classic Beef Burger', quantity: 2, unit_price: 8.99 }], 
    total_amount: 17.98, 
    tax_amount: 1.44, 
    payment_method: 'Simulated Pay', 
    date: new Date(Date.now() - 3600000).toISOString() 
  },
  { 
    id: 'TRX-P4M7N2Q8X', 
    user_id: 101, 
    items: [{ product_id: 5, name: 'Iced Coffee', quantity: 3, unit_price: 3.50 }], 
    total_amount: 10.50, 
    tax_amount: 0.84, 
    payment_method: 'Simulated Pay', 
    date: new Date(Date.now() - 7200000).toISOString() 
  }
];

// API routes - MUST be registered before the catch-all wildcard route
app.get('/api/sales', (req, res) => {
  res.json(sales);
});

app.post('/api/sales', (req, res) => {
  const newSale = {
    ...req.body,
    id: 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toISOString()
  };
  sales = [newSale, ...sales];
  res.status(201).json(newSale);
});

app.get('/api/products', (req, res) => {
  res.json(MOCK_PRODUCTS);
});

app.get('/api/categories', (req, res) => {
  res.json(MOCK_CATEGORIES);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  // Express 5 requires named wildcard parameters (*path instead of *)
  app.get('*path', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});
