const { generateQRCodeWithLogo } = require('../services/qrCodeGenerator');
const logger = require('../services/loggingService');  // Import the logger
const path = require('path');

/**
 * Controller to handle QR code generation
 */
exports.generateQRCode = async (req, res) => {
    const { text, format = 'png', pixel = 300 } = req.body;

    if (!text) {
        logger.error('Text content is required to generate QR code');
        return res.status(400).json({ error: 'Text content is required to generate QR code' });
    }

    try {
        const logoPath = path.join(__dirname, '../logo_dark_36.png');
        const filepath = await generateQRCodeWithLogo(text, format, pixel, logoPath);

        // Log the QR code generation request
        logger.info({
            message: 'QR code generated successfully',
            endpoint: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
        });

        res.status(200).json({ message: 'QR code generated and saved', filepath });
    } catch (error) {
        logger.error('Error generating QR code', { error: error.message });
        res.status(500).json({ error: 'QR code generation failed' });
    }
};
