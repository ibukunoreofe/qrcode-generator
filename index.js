const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

// QR Code generation endpoint
app.post('/qr-code/generate', async (req, res) => {
    const { text, format = 'png', pixel = 300 } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text content is required to generate QR code' });
    }

    try {
        // Generate the QR code buffer
        const qrCodeData = await QRCode.toBuffer(text, {
            width: pixel,
            errorCorrectionLevel: 'H',  // High error correction level
        });

        // Load the QR code and logo
        const qrImage = sharp(qrCodeData).resize(pixel, pixel);
        const logoPath = path.join(__dirname, 'logo_dark_36.png');
        const logoImage = sharp(logoPath).resize(Math.floor(pixel * 0.2), Math.floor(pixel * 0.2));

        // Composite the logo onto the QR code
        const combinedImage = await qrImage
            .composite([{ input: await logoImage.toBuffer(), gravity: 'center' }])
            .toBuffer();

        // Create a unique filename
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        const uniqueId = uuidv4();
        const filename = `qrcode_${timestamp}_${uniqueId}.${format}`;
        const filepath = path.join(__dirname, 'qrcodes', filename);

        // Ensure the directory exists
        if (!fs.existsSync(path.join(__dirname, 'qrcodes'))) {
            fs.mkdirSync(path.join(__dirname, 'qrcodes'));
        }

        // Save the image with compression
        await sharp(combinedImage)
            .png({ compressionLevel: 9, quality: 80 })  // Adjust compression settings
            .toFile(filepath);

        console.log(`QR code with logo saved as ${filename}`);

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
