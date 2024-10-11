const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a QR code with a logo in the center and outputs it as base64 or saves it to the file system.
 * @param {string} text - The content to encode in the QR code.
 * @param {string} format - The image format to save the QR code (e.g., 'png').
 * @param {number} pixel - The pixel size of the QR code.
 * @param {string} logoPath - The file path to the logo image to overlay.
 * @param {string} outputType - The output type: 'base64' or 'file' (default is 'base64').
 * @returns {Promise<string>} - The base64 string or file path of the saved QR code.
 */
async function generateQRCodeWithLogo(text, format = 'png', pixel = 300, logoPath, outputType = 'base64') {
    try {
        // Generate the QR code buffer with reduced margin
        const qrCodeData = await QRCode.toBuffer(text, {
            width: pixel,
            errorCorrectionLevel: 'H',
            margin: 1  // Reduce the white space (padding) around the QR code
        });

        // Load the QR code and logo
        const qrImage = sharp(qrCodeData).resize(pixel, pixel);
        const logoImage = sharp(logoPath).resize(Math.floor(pixel * 0.2), Math.floor(pixel * 0.2));

        // Composite the logo onto the QR code
        const combinedImage = await qrImage
            .composite([{ input: await logoImage.toBuffer(), gravity: 'center' }])
            .toBuffer();

        // Handle output based on the output type
        if (outputType === 'base64') {
            // Convert the image buffer to base64 and return it
            const base64Image = combinedImage.toString('base64');
            return `data:image/${format};base64,${base64Image}`;
        } else if (outputType === 'file') {
            // Create a unique filename with a timestamp and UUID
            const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
            const uniqueId = uuidv4();
            const filename = `qrcode_${timestamp}_${uniqueId}.${format}`;
            const filepath = path.join(__dirname, '../qrcodes', filename);

            // Ensure the 'qrcodes' directory exists
            if (!fs.existsSync(path.join(__dirname, '../qrcodes'))) {
                fs.mkdirSync(path.join(__dirname, '../qrcodes'));
            }

            // Save the final image with compression
            await sharp(combinedImage)
                .png({ compressionLevel: 9, quality: 80 })
                .toFile(filepath);

            console.log(`QR code with logo saved as ${filename}`);
            return filepath;
        } else {
            throw new Error('Invalid output type. Supported types: base64, file');
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQRCodeWithLogo };
