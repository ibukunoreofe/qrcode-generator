const { generateQRCodeWithLogo } = require('../services/qrCodeGeneratorService');
const logger = require('../services/loggingService');  // Import the logger
const path = require('path');
const OUTPUT_TYPES = require('../constants/outputTypes');  // Import the output types

/**
 * Controller to handle QR code generation
 */
exports.generateQRCode = async (req, res) => {
    const { text, format = 'png', pixel = 300, outputType = OUTPUT_TYPES.BASE64, minioOptions } = req.body;  // Accept outputType and MinIO options

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
        let result;

        // If outputType is 'minio', ensure required MinIO options are provided
        if (outputType === OUTPUT_TYPES.MINIO) {
            const { ACCESS_KEY_ID, SECRET_KEY, BUCKET, ENDPOINT, FINAL_URL, FILE_RELATIVE_PATH } = minioOptions || {};
            if (!ACCESS_KEY_ID || !SECRET_KEY || !BUCKET || !ENDPOINT || !FINAL_URL || !FILE_RELATIVE_PATH) {
                return res.status(400).json({ error: 'Missing required MinIO parameters.' });
            }
            // Pass MinIO options to the service
            result = await generateQRCodeWithLogo(text, format, pixel, logoPath, outputType, minioOptions);
        } else {
            // For base64 or file output
            result = await generateQRCodeWithLogo(text, format, pixel, logoPath, outputType);
        }

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

        if (outputType === OUTPUT_TYPES.BASE64) {
            return res.status(200).json({ image: result });
        } else if (outputType === OUTPUT_TYPES.FILE || outputType === OUTPUT_TYPES.MINIO) {
            return res.status(200).json({ message: 'QR code generated and saved', url: result });
        } else {
            return res.status(400).json({ error: `Invalid output type. Supported types: ${Object.values(OUTPUT_TYPES).join(', ')}` });
        }
    } catch (error) {
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
        return res.status(500).json({ error: 'QR code generation failed' });
    }
};
