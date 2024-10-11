const winston = require('winston');
require('winston-daily-rotate-file');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique identifier (UUID + timestamp)
 */
function generateUniqueId() {
    const uuid = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp to be filesystem safe
    return `${uuid}-${timestamp}`;
}

// Generate a unique identifier for this container
const uniqueId = generateUniqueId();

// Create a Winston logger with daily file rotation
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: `logs/qr-code-%DATE%-${uniqueId}.log`,  // Use the generated unique ID in the log filename
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',  // Maximum file size
            maxFiles: '14d',  // Keep logs for 14 days
        }),
    ],
});

module.exports = logger;
