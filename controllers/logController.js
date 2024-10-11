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

        // Filter only .log files and get stats (like creation time)
        const logFiles = files
            .filter(file => file.endsWith('.log')) // Filter for .log files
            .map(file => ({
                file,
                // Get file creation time for sorting
                ctime: fs.statSync(path.join(logPath, file)).ctime
            }))
            // Sort by creation time (newest first)
            .sort((a, b) => b.ctime - a.ctime);

        // Build the HTML table for logs
        let logList = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:hover {background-color: #f5f5f5;}
                h1 {
                    color: #333;
                }
            </style>
        </head>
        <body>
            <h1>Log Files</h1>
            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>`;

        logFiles.forEach(log => {
            logList += `
                <tr>
                    <td><a href="/logs/${log.file}">${log.file}</a></td>
                    <td>${log.ctime.toLocaleString()}</td>
                </tr>`;
        });

        logList += `
                </tbody>
            </table>
        </body>
        </html>`;

        // Send the formatted log list as the response
        res.send(logList);
    });
};
