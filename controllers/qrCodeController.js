const { generateQRCodeWithLogo } = require('../services/qrCodeGeneratorService');
const logger = require('../services/loggingService');  // Import the logger
const path = require('path');

/**
 * Controller to handle QR code generation
 */
exports.generateQRCode = async (req, res) => {
    const { text, format = 'png', pixel = 300, outputType = 'base64' } = req.body;  // Accept outputType in the request body

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
        const result = await generateQRCodeWithLogo(text, format, pixel, logoPath, outputType);  // Pass outputType to service

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

        if (outputType === 'base64') {
            // Return base64 image in the response body
            return res.status(200).json({ image: result });
        } else if (outputType === 'file') {
            // Return file path in the response
            return res.status(200).json({ message: 'QR code generated and saved', filepath: result });
        } else {
            return res.status(400).json({ error: 'Invalid output type. Supported types: base64, file' });
        }
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
