
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booking_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a UUID for the user
    const userId = require('uuid').v4();
    
    // Insert user
    await pool.execute(
      'INSERT INTO profiles (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, 'user']
    );
    
    // Generate JWT token
    const token = jwt.sign({ userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({ 
      user: { id: userId, email, name, role: 'user' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create test user route
app.post('/auth/setup-test-user', async (req, res) => {
  try {
    const testEmail = 'admin@example.com';
    const testPassword = 'abc123';
    
    // Check if test user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM profiles WHERE email = ?',
      [testEmail]
    );
    
    if (existingUsers.length > 0) {
      return res.json({ 
        message: 'Test user already exists',
        userId: existingUsers[0].id
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Generate a UUID for the user
    const userId = require('uuid').v4();
    
    // Insert test user with admin role
    await pool.execute(
      'INSERT INTO profiles (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'Test Admin', testEmail, hashedPassword, 'admin']
    );
    
    res.json({ 
      message: 'Test user created successfully',
      userId
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API routes - these would be expanded based on your application needs
// Resources (desks/meeting rooms)
app.get('/resources', authMiddleware, async (req, res) => {
  try {
    const [resources] = await pool.execute('SELECT * FROM resources');
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Maps
app.get('/maps', authMiddleware, async (req, res) => {
  try {
    const [maps] = await pool.execute('SELECT * FROM floor_maps');
    res.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings
app.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const [bookings] = await pool.execute('SELECT * FROM bookings');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Teams
app.get('/teams', authMiddleware, async (req, res) => {
  try {
    const [teams] = await pool.execute('SELECT * FROM teams');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users/profiles
app.get('/profiles', authMiddleware, async (req, res) => {
  try {
    const [profiles] = await pool.execute('SELECT id, name, email, role, team_id, avatar, bio, phone, is_team_leader FROM profiles');
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server startup
app.listen(PORT, async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
});
