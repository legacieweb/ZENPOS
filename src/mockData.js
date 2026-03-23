
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const DEFAULT_USERS = [
  { id: 100, name: 'Alex Thompson', email: 'manager@zenpos.com', password: 'manager', role: 'Manager' },
  { id: 101, name: 'Sarah Miller', email: 'staff@zenpos.com', password: 'staff', role: 'Staff' },
  { id: 102, name: 'Guest User', email: 'guest@zenpos.com', password: 'guest', role: 'Guest' }
];

const INITIAL_ACTIVITIES = [
  { id: 1, user: 'Alex Thompson', action: 'System Login', time: new Date(Date.now() - 10000000).toISOString() },
  { id: 2, user: 'Sarah Miller', action: 'Inventory Restock: Classic Beef Burger', time: new Date(Date.now() - 5000000).toISOString() },
  { id: 3, user: 'Alex Thompson', action: 'Price Update: Chocolate Milkshake', time: new Date(Date.now() - 2000000).toISOString() }
];

export const initializeData = () => {
  if (!localStorage.getItem('pos_users')) {
    localStorage.setItem('pos_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('pos_activities')) {
    localStorage.setItem('pos_activities', JSON.stringify(INITIAL_ACTIVITIES));
  }
  // Customer orders stored locally
  if (!localStorage.getItem('customer_orders')) {
    localStorage.setItem('customer_orders', JSON.stringify([]));
  }
  // Guest orders stored locally
  if (!localStorage.getItem('guest_orders')) {
    localStorage.setItem('guest_orders', JSON.stringify([]));
  }
};

export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Failed to fetch products from server', e);
  }
  return [];
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (response.ok) return await response.json();
  } catch (e) {
    console.error('Failed to fetch categories from server', e);
  }
  return [];
};

export const getUsers = () => JSON.parse(localStorage.getItem('pos_users') || '[]');
export const getActivities = () => JSON.parse(localStorage.getItem('pos_activities') || '[]');

export const getSales = async (userRole) => {
  if (userRole === 'Manager' || userRole === 'Staff') {
    try {
      const response = await fetch(`${API_URL}/sales`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.error('Failed to fetch sales from server', e);
    }
  }
  
  if (userRole === 'Guest') {
    return JSON.parse(localStorage.getItem('guest_orders') || '[]');
  }

  // Fallback to local customer orders
  return JSON.parse(localStorage.getItem('customer_orders') || '[]');
};

export const logActivity = (user, action) => {
  const activities = getActivities();
  const newActivity = {
    id: Date.now(),
    user,
    action,
    time: new Date().toISOString()
  };
  localStorage.setItem('pos_activities', JSON.stringify([newActivity, ...activities]));
};

export const createStaff = (name, email, password) => {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Personnel email already registered' };
  const newStaff = { id: Date.now(), name, email, password, role: 'Staff' };
  localStorage.setItem('pos_users', JSON.stringify([...users, newStaff]));
  logActivity('System', `Hired new personnel: ${name} (${email})`);
  return { user: newStaff };
};

export const saveSale = async (saleData, userRole) => {
  if (userRole === 'Manager' || userRole === 'Staff') {
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.error('Failed to save sale to server', e);
    }
  }

  const storageKey = userRole === 'Guest' ? 'guest_orders' : 'customer_orders';
  const prefix = userRole === 'Guest' ? 'GST-' : 'ORD-';
  
  // Save locally
  const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const newOrder = {
    ...saleData,
    id: prefix + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toISOString()
  };
  localStorage.setItem(storageKey, JSON.stringify([newOrder, ...orders]));
  return newOrder;
};

export const authenticate = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) logActivity(user.name, 'Logged into terminal');
  return user || null;
};

export const guestLogin = () => {
  const guestUser = { id: 102, name: 'Guest User', email: 'guest@zenpos.com', role: 'Guest' };
  logActivity('Guest User', 'Logged in as temporary guest');
  return guestUser;
};

export const signup = (name, email, password) => {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Email already exists' };
  const newUser = { id: Date.now(), name, email, password, role: 'Customer' };
  localStorage.setItem('pos_users', JSON.stringify([...users, newUser]));
  logActivity(name, 'Account registered');
  return { user: newUser };
};
