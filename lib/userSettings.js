const fs = require('fs');
const path = require('path');

const USER_SETTINGS_DIR = path.join(__dirname, '../user_settings');

// Ensure directory exists
if (!fs.existsSync(USER_SETTINGS_DIR)) {
    fs.mkdirSync(USER_SETTINGS_DIR, { recursive: true });
}

function getUserSettingsPath(userId) {
    // Sanitize userId (remove special characters)
    const safeId = userId.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(USER_SETTINGS_DIR, `${safeId}.json`);
}

function loadUserSettings(userId) {
    const filePath = getUserSettingsPath(userId);
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (error) {
        console.error(`Error loading settings for ${userId}:`, error);
    }
    
    // Default settings
    return {
        userId,
        anticall: { enabled: false },
        dmblocker: { enabled: false },
        autostatus: { enabled: false },
        autosticker: { enabled: false },
        antidelete: { enabled: false },
        autoread: { enabled: false },
        autotyping: { enabled: false },
        autorecording: { enabled: false },
        autovoice: { enabled: false },
        autoreply: { enabled: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function saveUserSettings(userId, settings) {
    const filePath = getUserSettingsPath(userId);
    settings.updatedAt = new Date().toISOString();
    
    try {
        fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving settings for ${userId}:`, error);
        return false;
    }
}

function updateUserSetting(userId, feature, setting, value) {
    const settings = loadUserSettings(userId);
    
    if (!settings[feature]) {
        settings[feature] = {};
    }
    
    settings[feature][setting] = value;
    return saveUserSettings(userId, settings);
}

function getUserFeature(userId, feature) {
    const settings = loadUserSettings(userId);
    return settings[feature] || { enabled: false };
}

module.exports = {
    loadUserSettings,
    saveUserSettings,
    updateUserSetting,
    getUserFeature
};