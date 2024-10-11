// logController.js
const fs = require('fs');
const path = require('path');
const logger = require('../services/loggingService'); // Import logger
const { formatLogEntries } = require('../utils/logFormatter'); // Import log formatting helper

/**
 * Controller to handle viewing a specific log file with structured JSON formatting, message as title, and level-based color coding
 */
exports.viewLogFile = (req, res) => {
    const filePath = path.join(__dirname, '../logs', req.params.filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            logger.error(`Log file not found: ${req.params.filename}`, { error: err.message });
            return res.status(404).send('Log file not found');
        }

        // Use the helper to format the log entries
        const formattedLog = formatLogEntries(data, req.params.filename);

        // Send the formatted log to the browser
        res.send(formattedLog);
    });
};

/**
 * Controller to handle viewing the list of log files
 */
exports.viewLogs = (req, res) => {
    const logPath = path.join(__dirname, '../logs');

    fs.readdir(logPath, (err, files) => {
        if (err) {
            logger.error('Error reading log files', { error: err.message });
            return res.status(500).send('Could not load logs');
        }

        let logList = '<h1>Log Files</h1><ul>';
        files.forEach(file => {
            logList += `<li><a href="/logs/${file}">${file}</a></li>`;
        });
        logList += '</ul>';

        res.send(logList);
    });
};
