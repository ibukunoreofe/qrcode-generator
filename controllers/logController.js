const fs = require('fs');
const path = require('path');
const logger = require('../services/loggingService');  // Import the logger

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

        logger.info('Log files viewed');
        res.send(logList);
    });
};

/**
 * Controller to handle viewing a specific log file
 */
exports.viewLogFile = (req, res) => {
    const filePath = path.join(__dirname, '../logs', req.params.filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).send('Log file not found');

        // Display log file contents as HTML
        res.send(`<h1>Log File: ${req.params.filename}</h1><pre>${data}</pre>`);
    });
};
