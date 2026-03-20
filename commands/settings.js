const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');
const userSettings = require('../lib/userSettings');

// Helper to read JSON files safely
function readJsonSafe(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) return fallback;
        const txt = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

/**
 * Read user-specific config from legacy structure
 * @param {string} baseDir - Base directory for configs
 * @param {string} userId - User's JID
 * @param {string} subPath - Subpath to config file
 * @param {any} fallback - Fallback value
 * @returns {any} User's config
 */
function readLegacyUserJson(baseDir, userId, subPath, fallback) {
    try {
        const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
        const filePath = path.join(baseDir, sanitizedId, subPath);
        if (!fs.existsSync(filePath)) return fallback;
        const txt = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

/**
 * Read group settings for a specific user
 * @param {string} ownerId - The user's JID
 * @returns {Object} Group settings
 */
function readUserGroupSettings(ownerId) {
    const groupSettingsPath = path.join(__dirname, '..', 'data', 'group_settings', `${ownerId.replace(/[^a-zA-Z0-9@._-]/g, '_')}.json`);
    
    if (fs.existsSync(groupSettingsPath)) {
        try {
            return JSON.parse(fs.readFileSync(groupSettingsPath, 'utf8'));
        } catch (e) {
            console.error('Error reading group settings:', e);
        }
    }
    
    return {
        antilink: {},
        antibadword: {},
        welcome: {},
        goodbye: {},
        chatbot: {},
        antitag: {},
        autoReaction: false
    };
}

async function settingsCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        // Get the owner ID for this session
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Only the session owner can view their own settings
        if (senderId !== ownerId && !message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ You can only view your own settings!\n\nEach user has their own configuration.' 
            }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';
        
        // Global settings (shared across all users)
        const mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        
        // Get settings from userSettings (new system) - REAL TIME
        const anticall = userSettings.getUserFeature(ownerId, 'anticall');
        const autoread = userSettings.getUserFeature(ownerId, 'autoread');
        const autotyping = userSettings.getUserFeature(ownerId, 'autotyping');
        const dmblocker = userSettings.getUserFeature(ownerId, 'dmblocker');
        const autorecording = userSettings.getUserFeature(ownerId, 'autorecording');
        const autoreply = userSettings.getUserFeature(ownerId, 'autoreply');
        const autovoice = userSettings.getUserFeature(ownerId, 'autovoice');
        const autosticker = userSettings.getUserFeature(ownerId, 'autosticker');
        
        // Auto-status (legacy)
        const autoStatus = readLegacyUserJson(dataDir, ownerId, 'autostatus/config.json', { enabled: false });
        
        // Antidelete (legacy)
        const antidelete = readLegacyUserJson(dataDir, ownerId, 'antidelete/config.json', { enabled: false });
        
        // Auto-sticker triggers count
        const stickerTriggers = autosticker.triggers || {};
        const stickerCount = Object.keys(stickerTriggers).length;
        
        // Auto-voice file check
        const hasVoiceFile = autovoice.voiceNoteFile ? true : false;
        
        // Read group settings for this user
        const userGroupData = readUserGroupSettings(ownerId);
        const autoReaction = Boolean(userGroupData.autoReaction);

        // Per-group features for current group
        const groupId = isGroup ? chatId : null;
        const antilinkOn = groupId ? Boolean(userGroupData.antilink && userGroupData.antilink[groupId]) : false;
        const antibadwordOn = groupId ? Boolean(userGroupData.antibadword && userGroupData.antibadword[groupId]) : false;
        const welcomeOn = groupId ? Boolean(userGroupData.welcome && userGroupData.welcome[groupId]) : false;
        const goodbyeOn = groupId ? Boolean(userGroupData.goodbye && userGroupData.goodbye[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot && userGroupData.chatbot[groupId]) : false;
        const antitagCfg = groupId ? (userGroupData.antitag && userGroupData.antitag[groupId]) : null;

        const lines = [];
        lines.push('*📊 YOUR BOT SETTINGS*');
        lines.push(`👤 *User:* ${ownerId.split('@')[0]}`);
        lines.push('─────────────────');
        lines.push('');
        
        // Global settings
        lines.push('*🌐 GLOBAL*');
        lines.push(`• Mode: ${mode.isPublic ? 'Public' : 'Private'}`);
        lines.push('');
        
        // User-specific settings (from new system) - REAL TIME
        lines.push('*🔧 YOUR FEATURES*');
        lines.push(`• Auto Status: ${autoStatus.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Autoread: ${autoread.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Autotyping: ${autotyping.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Auto-recording: ${autorecording.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Auto-sticker: ${autosticker.enabled ? `✅ ON (${stickerCount} triggers)` : '❌ OFF'}`);
        lines.push(`• Auto-voice: ${autovoice.enabled && hasVoiceFile ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Auto-reply: ${autoreply.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• PM Blocker: ${dmblocker.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Anticall: ${anticall.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Antidelete: ${antidelete.enabled ? '✅ ON' : '❌ OFF'}`);
        lines.push(`• Auto Reaction: ${autoReaction ? '✅ ON' : '❌ OFF'}`);
        
        if (groupId) {
            lines.push('');
            lines.push('*👥 GROUP SETTINGS*');
            lines.push(`Group: ${groupId.split('@')[0].substring(0, 10)}...`);
            if (antilinkOn) {
                const al = userGroupData.antilink[groupId];
                lines.push(`• Antilink: ✅ ON (action: ${al.action || 'delete'})`);
            } else {
                lines.push('• Antilink: ❌ OFF');
            }
            if (antibadwordOn) {
                const ab = userGroupData.antibadword[groupId];
                lines.push(`• Antibadword: ✅ ON (action: ${ab.action || 'delete'})`);
            } else {
                lines.push('• Antibadword: ❌ OFF');
            }
            lines.push(`• Welcome: ${welcomeOn ? '✅ ON' : '❌ OFF'}`);
            lines.push(`• Goodbye: ${goodbyeOn ? '✅ ON' : '❌ OFF'}`);
            lines.push(`• Chatbot: ${chatbotOn ? '✅ ON' : '❌ OFF'}`);
            if (antitagCfg && antitagCfg.enabled) {
                lines.push(`• Antitag: ✅ ON (action: ${antitagCfg.action || 'delete'})`);
            } else {
                lines.push('• Antitag: ❌ OFF');
            }
        } else {
            lines.push('');
            lines.push('📝 *Note:* Per-group settings will be shown when used inside a group.');
        }
        
        lines.push('');
        lines.push('─────────────────');
        lines.push('✨ *404 XMD*');

        await sock.sendMessage(chatId, { text: lines.join('\n') }, { quoted: message });
        
    } catch (error) {
        console.error('Error in settings command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to read settings. Please try again later.' 
        }, { quoted: message });
    }
}

module.exports = settingsCommand;