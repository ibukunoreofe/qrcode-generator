const express = require('express');
const { generateQRCode } = require('./controllers/qrCodeController');  // QR code controller
const { viewLogs, viewLogFile } = require('./controllers/logController');  // Log controller
const basicAuth = require('express-basic-auth');
const authMiddleware = require('./middleware/authMiddleware');  // Bearer Token Middleware

const app = express();
app.use(express.json());

// QR Code generation route with Bearer Token authentication
app.post('/qr-code/generate', authMiddleware, generateQRCode);

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
