const { generateQRCodeWithLogo } = require('../services/qrCodeGenerator');
const logger = require('../services/loggingService');  // Import the logger
const path = require('path');

/**
 * Controller to handle QR code generation
 */
exports.generateQRCode = async (req, res) => {
    const { text, format = 'png', pixel = 300 } = req.body;

    if (!text) {
        logger.error({
            message: 'Text content is required to generate QR code',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            endpoint: req.originalUrl,
            method: req.method,
            queryParams: req.query,
            bodyParams: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({ error: 'Text content is required to generate QR code' });
    }

    try {
        const logoPath = path.join(__dirname, '../logo_dark_36.png');
        const filepath = await generateQRCodeWithLogo(text, format, pixel, logoPath);

        // Log the QR code generation request
        logger.info({
            message: 'QR code generated successfully',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            endpoint: req.originalUrl,
            method: req.method,
            queryParams: req.query,
            bodyParams: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString(),
        });

        res.status(200).json({ message: 'QR code generated and saved', filepath });
    } catch (error) {
        // Log the error details along with request information for troubleshooting
        logger.error({
            message: 'Error generating QR code',
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            endpoint: req.originalUrl,
            method: req.method,
            queryParams: req.query,
            bodyParams: req.body,
            headers: req.headers,
            error: error.message,
            timestamp: new Date().toISOString(),
        });
        res.status(500).json({ error: 'QR code generation failed' });
    }
};
