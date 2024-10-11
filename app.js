const express = require('express');
const { generateQRCode } = require('./controllers/qrCodeController');  // QR code controller
const { viewLogs, viewLogFile } = require('./controllers/logController');  // Log controller
const basicAuth = require('express-basic-auth');
const authMiddleware = require('./middleware/authMiddleware');  // Bearer Token Middleware
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Rate limiter middleware - 50 requests per second (1000ms) per IP
const qrCodeRateLimiter = rateLimit({
    windowMs: 1000, // 1 second window
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP, please try again after a second.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Root route - Landing page
app.get('/', (req, res) => {
    res.status(200).send('Welcome to QR Code Generator!');
});

// QR Code generation route with Bearer Token authentication and rate limiter
app.post('/qr-code/generate', authMiddleware, qrCodeRateLimiter, generateQRCode);

// Protect the logs endpoint with basic authentication
app.use('/logs', basicAuth({
    users: { [process.env.LOG_USERNAME]: process.env.LOG_PASSWORD }, // Get credentials from .env
    challenge: true,  // Prompts for basic auth in the browser
}));

// Log viewing routes
app.get('/logs', viewLogs);  // View list of log files
app.get('/logs/:filename', viewLogFile);  // View specific log file

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
