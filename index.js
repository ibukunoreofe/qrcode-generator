const express = require('express');
const { generateQRCode } = require('./controllers/qrCodeController');  // Import the QR code controller
const app = express();

app.use(express.json());

// QR Code generation endpoint
app.post('/qr-code/generate', generateQRCode);  // Use the controller for handling requests

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QR Code Generator API running on port ${PORT}`);
});
