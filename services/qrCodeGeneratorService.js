const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');  // AWS SDK for S3-compatible storage
const OUTPUT_TYPES = require('../constants/outputTypes');  // Import the output types

/**
 * Generates a QR code with a logo in the center and outputs it as base64, saves it to the file system, or uploads it to MinIO.
 * @param {string} text - The content to encode in the QR code.
 * @param {string} format - The image format to save the QR code (e.g., 'png').
 * @param {number} pixel - The pixel size of the QR code.
 * @param {string} logoPath - The file path to the logo image to overlay.
 * @param {string} outputType - The output type: 'base64', 'file', or 'minio'.
 * @param {object} minioOptions - Options for MinIO upload (for 'minio' output type only).
 * @returns {Promise<string>} - The base64 string, file path, or public URL of the saved/uploaded QR code.
 */
async function generateQRCodeWithLogo(text, format = 'png', pixel = 300, logoPath, outputType = OUTPUT_TYPES.BASE64, minioOptions = {}) {
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
        if (outputType === OUTPUT_TYPES.BASE64) {
            // Convert the image buffer to base64 and return it
            const base64Image = combinedImage.toString('base64');
            return `data:image/${format};base64,${base64Image}`;
        } else if (outputType === OUTPUT_TYPES.FILE) {
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

            return filepath;
        } else if (outputType === OUTPUT_TYPES.MINIO) {
            // Validate MinIO options
            const { ACCESS_KEY_ID, SECRET_KEY, BUCKET, ENDPOINT, FINAL_URL, FILE_RELATIVE_PATH, DEFAULT_REGION = 'us-east-1' } = minioOptions;

            if (!ACCESS_KEY_ID || !SECRET_KEY || !BUCKET || !ENDPOINT || !FINAL_URL || !FILE_RELATIVE_PATH) {
                throw new Error('Missing required MinIO parameters.');
            }

            // Initialize AWS S3 client (compatible with MinIO)
            const s3 = new AWS.S3({
                accessKeyId: ACCESS_KEY_ID,
                secretAccessKey: SECRET_KEY,
                endpoint: ENDPOINT,
                s3ForcePathStyle: true,
                signatureVersion: 'v4',
                region: DEFAULT_REGION
            });

            const uploadParams = {
                Bucket: BUCKET,
                Key: FILE_RELATIVE_PATH,
                Body: combinedImage,
                ContentType: `image/${format}`,
            };

            // Upload the file to MinIO
            await s3.upload(uploadParams).promise();

            // Return the public URL to the uploaded file
            return `${FINAL_URL}/${FILE_RELATIVE_PATH}`;
        } else {
            throw new Error(`Invalid output type. Supported types: ${Object.values(OUTPUT_TYPES).join(', ')}`);
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQRCodeWithLogo };
