// /lib/functions.js
function runtime(seconds) {
    seconds = Number(seconds);
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor(seconds % (3600 * 24) / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (secs > 0) parts.push(`${secs} second${secs > 1 ? 's' : ''}`);
    
    return parts.join(', ') || '0 seconds';
}

// Format bytes to human readable size
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate random string
function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Parse time string (like "1h30m") to seconds
function parseTime(timeString) {
    const timeRegex = /(\d+)([dhms])/g;
    let totalSeconds = 0;
    let match;
    
    while ((match = timeRegex.exec(timeString)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch(unit) {
            case 'd': totalSeconds += value * 24 * 60 * 60; break;
            case 'h': totalSeconds += value * 60 * 60; break;
            case 'm': totalSeconds += value * 60; break;
            case 's': totalSeconds += value; break;
        }
    }
    
    return totalSeconds;
}

// Get current timestamp in different formats
function getTimestamp(format = 'full') {
    const now = new Date();
    
    switch(format) {
        case 'time':
            return now.toLocaleTimeString();
        case 'date':
            return now.toLocaleDateString();
        case 'iso':
            return now.toISOString();
        case 'unix':
            return Math.floor(now.getTime() / 1000);
        default:
            return now.toLocaleString();
    }
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if string is numeric
function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

// Truncate text
function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Capitalize first letter
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Format duration in MM:SS format
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Sanitize filename
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
}

// Calculate percentage
function calculatePercentage(part, total) {
    return total === 0 ? 0 : ((part / total) * 100).toFixed(2);
}

// Export all functions
module.exports = {
    runtime,
    formatBytes,
    formatNumber,
    randomString,
    parseTime,
    getTimestamp,
    isValidUrl,
    delay,
    isNumeric,
    truncate,
    capitalize,
    formatDuration,
    getRandomItem,
    sanitizeFilename,
    calculatePercentage
};