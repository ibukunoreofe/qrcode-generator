const path = require('path');
const { generateQRCodeWithLogo } = require('../services/qrCodeGenerator');  // Import the QR code generator

/**
 * Controller to handle QR code generation API request.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.generateQRCode = async (req, res) => {
    const { text, format = 'png', pixel = 300 } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text content is required to generate QR code' });
    }

    try {
        // Generate the QR code with the logo
        const filepath = await generateQRCodeWithLogo(text, format, pixel, path.join(__dirname, '../logo_dark_36.png'));

        // Respond with the file path of the saved QR code
        res.status(200).json({ message: 'QR code generated and saved', filepath });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'QR code generation failed' });
    }
};
