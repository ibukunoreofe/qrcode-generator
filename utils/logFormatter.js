// logFormatter.js

/**
 * Helper function to format log entries with structured JSON formatting, message as title, and level-based color coding
 * Adds JavaScript for filtering logs by level.
 * @param {string} logData - Raw log file data
 * @param {string} filename - The name of the log file
 * @returns {string} - Formatted HTML log content with filtering options
 */
exports.formatLogEntries = (logData, filename) => {
    const logLines = logData.split('\n').filter(line => line.trim() !== ''); // Remove empty lines

    // Count log levels
    const logCounts = {
        error: 0,
        info: 0,
        warn: 0,
        debug: 0,
        total: logLines.length,
    };

    let formattedLog = `
        <h1>Log File: ${filename}</h1>
        <div style="font-family: monospace;">
        <div id="log-controls">
            <button onclick="filterLogs('error')">ERROR (${logCounts.error})</button>
            <button onclick="filterLogs('info')">INFO (${logCounts.info})</button>
            <button onclick="filterLogs('warn')">WARN (${logCounts.warn})</button>
            <button onclick="filterLogs('debug')">DEBUG (${logCounts.debug})</button>
            <button onclick="filterLogs('all')">ALL (${logCounts.total})</button>
        </div>
        <div id="log-entries">
    `;

    logLines.forEach((line, index) => {
        try {
            const logEntry = JSON.parse(line); // Parse the line as JSON
            const logLevel = logEntry.level || 'unknown';

            // Increment the count for each log level
            if (logLevel === 'error') logCounts.error++;
            if (logLevel === 'info') logCounts.info++;
            if (logLevel === 'warn') logCounts.warn++;
            if (logLevel === 'debug') logCounts.debug++;

            // Determine color based on the log level
            let panelColor = '#f4f4f4'; // Default panel color
            let titleColor = '#333'; // Default title color
            let visibilityClass = 'log-hidden'; // Hidden by default, will show based on filtering

            if (logLevel === 'info') {
                panelColor = '#d9edf7';  // Blue for INFO
                titleColor = '#31708f';  // Dark blue for heading
                visibilityClass = 'log-info';
            } else if (logLevel === 'error') {
                panelColor = '#f2dede';  // Red for ERROR
                titleColor = '#a94442';  // Dark red for heading
                visibilityClass = 'log-error'; // Visible by default for ERROR
            } else if (logLevel === 'warn') {
                panelColor = '#fcf8e3';  // Yellow for WARN
                titleColor = '#8a6d3b';  // Dark yellow for heading
                visibilityClass = 'log-warn';
            } else if (logLevel === 'debug') {
                panelColor = '#dff0d8';  // Green for DEBUG
                titleColor = '#3c763d';  // Dark green for heading
                visibilityClass = 'log-debug';
            }

            const { message, level, ...rest } = logEntry;

            formattedLog += `
                <div class="${visibilityClass}" style="margin-bottom: 10px; padding: 10px; background-color: ${panelColor}; border: 1px solid #ddd;">
                    <strong style="font-size: 16px; color: ${titleColor};">${message || 'Log Entry'}</strong><br>
                    <span style="font-size: 14px; color: ${titleColor};">Level: ${level || 'N/A'}</span><br>
                    <pre style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${JSON.stringify(rest, null, 2)}</pre>
                </div>
            `;
        } catch (jsonError) {
            formattedLog += `<div style="color:red;">Invalid JSON: ${line}</div>`;
        }
    });

    formattedLog += `
        </div>
        <a href="/logs">Back to Log List</a>
        </div>
        <script>
            function filterLogs(level) {
                const logEntries = document.querySelectorAll('#log-entries > div');
                logEntries.forEach(entry => {
                    entry.style.display = 'none';
                });
                
                if (level === 'all') {
                    logEntries.forEach(entry => {
                        entry.style.display = 'block';
                    });
                } else {
                    const visibleEntries = document.querySelectorAll('.log-' + level);
                    visibleEntries.forEach(entry => {
                        entry.style.display = 'block';
                    });
                }
            }
            // Set default view to ERROR logs only
            filterLogs('error');
        </script>
    `;

    return formattedLog;
};
