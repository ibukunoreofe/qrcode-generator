const express = require('express');
const path = require('path');
const { generateQRCodeWithLogo } = require('./qrCodeGenerator');  // Import the QR code generation function
const app = express();

app.use(express.json());

// QR Code generation endpoint
app.post('/qr-code/generate', async (req, res) => {
    const { text, format = 'png', pixel = 300 } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text content is required to generate QR code' });
    }

    try {
        // Generate the QR code with the logo
        const filepath = await generateQRCodeWithLogo(text, format, pixel, path.join(__dirname, 'logo_dark_36.png'));

        // Respond with the file path of the saved QR code
        res.status(200).json({ message: 'QR code generated and saved', filepath });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'QR code generation failed' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QR Code Generator API running on port ${PORT}`);
});
