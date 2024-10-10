const fs = require('fs');
const path = require('path');
const logger = require('../services/loggingService');  // Import the logger

/**
 * Controller to handle viewing the list of log files with search and pagination
 */
exports.viewLogs = (req, res) => {
    const logPath = path.join(__dirname, '../logs');
    const searchQuery = req.query.search || '';  // Capture search query
    const page = parseInt(req.query.page) || 1;  // Capture pagination, default to page 1
    const logsPerPage = 10;  // Number of logs per page

    fs.readdir(logPath, (err, files) => {
        if (err) {
            logger.error('Error reading log files', { error: err.message });
            return res.status(500).send('Could not load logs');
        }

        // Filter files based on search query
        const filteredFiles = files.filter(file => file.toLowerCase().includes(searchQuery.toLowerCase()));

        // Paginate the filtered files
        const paginatedFiles = filteredFiles.slice((page - 1) * logsPerPage, page * logsPerPage);

        let logList = `
            <h1>Log Files</h1>
            <form action="/logs" method="GET">
                <input type="text" name="search" placeholder="Search logs" value="${searchQuery}">
                <button type="submit">Search</button>
            </form>
            <ul>
        `;
        paginatedFiles.forEach(file => {
            logList += `<li><a href="/logs/${file}">${file}</a></li>`;
        });
        logList += '</ul>';

        // Pagination Controls
        const totalPages = Math.ceil(filteredFiles.length / logsPerPage);
        if (page > 1) {
            logList += `<a href="/logs?page=${page - 1}&search=${searchQuery}">Previous</a>`;
        }
        if (page < totalPages) {
            logList += `<a href="/logs?page=${page + 1}&search=${searchQuery}">Next</a>`;
        }

        res.send(logList);
    });
};

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

        // Split the log file into individual lines
        const logLines = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines

        // Parse each line as JSON and format the output
        let formattedLog = '<h1>Log File: ' + req.params.filename + '</h1><div style="font-family: monospace;">';

        logLines.forEach((line, index) => {
            try {
                const logEntry = JSON.parse(line); // Parse the line as JSON

                // Determine color based on the log level
                let panelColor = '#f4f4f4'; // Default panel color
                let titleColor = '#333'; // Default title color
                if (logEntry.level === 'info') {
                    panelColor = '#d9edf7';  // Blue for INFO
                    titleColor = '#31708f';  // Dark blue for heading
                } else if (logEntry.level === 'error') {
                    panelColor = '#f2dede';  // Red for ERROR
                    titleColor = '#a94442';  // Dark red for heading
                } else if (logEntry.level === 'warn') {
                    panelColor = '#fcf8e3';  // Yellow for WARN
                    titleColor = '#8a6d3b';  // Dark yellow for heading
                } else if (logEntry.level === 'debug') {
                    panelColor = '#dff0d8';  // Green for DEBUG
                    titleColor = '#3c763d';  // Dark green for heading
                }

                // Remove the 'message' and 'level' fields from the JSON body
                const { message, level, ...rest } = logEntry;

                formattedLog += `
                    <div style="margin-bottom: 10px; padding: 10px; background-color: ${panelColor}; border: 1px solid #ddd;">
                        <strong style="font-size: 16px; color: ${titleColor};">${message || 'Log Entry'}</strong><br>
                        <span style="font-size: 14px; color: ${titleColor};">Level: ${level || 'N/A'}</span><br>
                        <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${JSON.stringify(rest, null, 2)}</pre> <!-- Pretty print remaining JSON -->
                    </div>
                `;
            } catch (jsonError) {
                // Handle cases where the line is not valid JSON
                formattedLog += `<div style="color:red;">Invalid JSON: ${line}</div>`;
            }
        });

        formattedLog += '</div><a href="/logs">Back to Log List</a>';

        // Send the formatted log to the browser
        res.send(formattedLog);
    });
};
