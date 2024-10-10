const winston = require('winston');
require('winston-daily-rotate-file');

// Create a Winston logger with daily file rotation
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/qr-code-%DATE%.log',  // Logs directory
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',  // Maximum file size
            maxFiles: '14d',  // Keep logs for 14 days
        }),
    ],
});

module.exports = logger;
