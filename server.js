require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { neon } = require('@netlify/neon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation
if (!process.env.NETLIFY_DATABASE_URL) {
    console.error('NETLIFY_DATABASE_URL is required');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
}

// Neon database connection
let sql;
try {
    sql = neon(process.env.NETLIFY_DATABASE_URL);
    console.log('Database connection initialized');
} catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// Security middleware
app.use(helmet());

// Enable CORS (allow only trusted domains, adjust as needed)
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.PRODUCTION_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Example API endpoint (for future features)
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Welcome to Creative Services Hub API!' });
});

// Get all posts from Neon database
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await sql`SELECT * FROM posts`;
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get a post by ID from Neon database
app.get('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Contact form endpoint with validation
app.post('/api/contact',
    [
        body('name').trim().isLength({ min: 2, max: 50 }).escape(),
        body('email').isEmail().normalizeEmail(),
        body('message').trim().isLength({ min: 5, max: 1000 }).escape()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, email, message } = req.body;
        console.log('Contact form submission:', { name, email, message });
        // TODO: Save to database or send email
        res.json({ success: true, message: 'Contact form received.' });
    }
);

// User registration endpoint
app.post('/api/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Check if user exists
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;
        res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Registration error' });
    }
});

// User login endpoint
app.post('/api/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        // Create JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ error: 'Login error' });
    }
});

// Request service form endpoint with validation
app.post('/api/request',
    [
        body('name').trim().isLength({ min: 2, max: 50 }).escape(),
        body('email').isEmail().normalizeEmail(),
        body('service').isLength({ min: 2, max: 50 }).escape(),
        body('details').trim().isLength({ min: 5, max: 1000 }).escape()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, email, service, details } = req.body;
        console.log('Service request submission:', { name, email, service, details });
        // TODO: Save to database or send email
        res.json({ success: true, message: 'Service request received.' });
    }
);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});
