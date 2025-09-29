const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Enable CORS (allow only trusted domains, adjust as needed)
app.use(cors({
    origin: [
        'http://localhost:3000',
        // Add your production domain here, e.g. 'https://your-app.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: false
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
