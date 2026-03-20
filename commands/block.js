const fs = require('fs');
const path = require('path');
const userSettings = require('../lib/userSettings');

// Base directory for user-specific block lists (still need this for storing block lists)
const BLOCK_BASE_DIR = path.join(__dirname, '..', 'data', 'block_lists');

// Ensure base directory exists
if (!fs.existsSync(BLOCK_BASE_DIR)) {
    fs.mkdirSync(BLOCK_BASE_DIR, { recursive: true });
}

// Cache for faster access
const blockListCache = new Map();

/**
 * Get the block list path for a specific user
 * @param {string} userId - The user's JID
 * @returns {string} Path to user's block list file
 */
function getUserBlockPath(userId) {
    const sanitizedId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(BLOCK_BASE_DIR, `${sanitizedId}.json`);
}

/**
 * Load block list for a specific user
 * @param {string} userId - The user's JID
 * @returns {Object} User's block list
 */
function loadUserBlockList(userId) {
    // Check cache first
    if (blockListCache.has(userId)) {
        return blockListCache.get(userId);
    }
    
    const blockPath = getUserBlockPath(userId);
    
    if (!fs.existsSync(blockPath)) {
        const defaultList = { 
            users: [], 
            groups: {},
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(blockPath, JSON.stringify(defaultList, null, 2));
        blockListCache.set(userId, defaultList);
        return defaultList;
    }
    
    try {
        const data = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        blockListCache.set(userId, data);
        return data;
    } catch (error) {
        console.error(`Error loading block list for ${userId}:`, error);
        const defaultList = { users: [], groups: {} };
        blockListCache.set(userId, defaultList);
        return defaultList;
    }
}

/**
 * Save block list for a specific user
 * @param {string} userId - The user's JID
 * @param {Object} blockList - User's block list
 */
function saveUserBlockList(userId, blockList) {
    try {
        const blockPath = getUserBlockPath(userId);
        blockList.lastUpdated = new Date().toISOString();
        fs.writeFileSync(blockPath, JSON.stringify(blockList, null, 2));
        
        // Update cache
        blockListCache.set(userId, blockList);
    } catch (error) {
        console.error(`Error saving block list for ${userId}:`, error);
    }
}

/**
 * Check if a user is blocked for a specific session owner
 * @param {string} ownerId - The session owner's JID
 * @param {string} targetJid - The target user's JID
 * @returns {boolean} Whether the target is blocked
 */
function isUserBlocked(ownerId, targetJid) {
    try {
        const blockList = loadUserBlockList(ownerId);
        return blockList.users.includes(targetJid);
    } catch (error) {
        console.error('Error checking block status:', error);
        return false;
    }
}

/**
 * Migrate legacy data from userSettings to block list files
 * (if there were any blocks stored in userSettings)
 */
function migrateLegacyData() {
    // This command previously stored blocks in separate files,
    // so no migration needed from userSettings
    console.log('📋 Block lists are stored in data/block_lists/');
}

migrateLegacyData();

/**
 * Clear cache for a specific user
 */
function clearUserCache(userId) {
    blockListCache.delete(userId);
}

async function blockCommand(sock, chatId, message) {
    try {
        // Get the bot's JID
        const botNumber = sock.user.id.split(':')[0];
        const botJid = `${botNumber}@s.whatsapp.net`;
        
        // Get the session owner ID (the person who owns this bot session)
        const ownerId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Get the sender's JID correctly
        let senderJid;
        
        if (message.key.fromMe) {
            // The message was sent BY the bot account (owner typing)
            senderJid = ownerId;
        } else if (message.key.participant) {
            // In a group, participant is the sender
            senderJid = message.key.participant;
        } else {
            // In private chat from someone else
            senderJid = message.key.remoteJid;
        }
        
        // Only the session owner can use block command for their session
        if (senderJid !== ownerId && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: "❌ Only the owner of this bot session can use this command.\n\nEach user has their own block list.",
                quoted: message 
            });
            return;
        }

        let targetJid;

        // Check if it's a private chat (1-on-1)
        if (chatId.endsWith('@s.whatsapp.net')) {
            // In private chat: block the person you're chatting with
            targetJid = chatId;
        } 
        // Check if it's a group chat
        else if (chatId.endsWith('@g.us')) {
            // In group: Check if you're replying to someone
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                // Get the sender of the quoted message
                targetJid = message.message.extendedTextMessage.contextInfo.participant;
            } else {
                await sock.sendMessage(chatId, { 
                    text: "❌ In groups, you must reply to the user's message you want to block.\n\nUsage: Reply to their message with `.block`",
                    quoted: message 
                });
                return;
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: "❌ This command only works in private chats or when replying to someone in groups.",
                quoted: message 
            });
            return;
        }

        // Don't allow blocking yourself
        if (targetJid === senderJid) {
            await sock.sendMessage(chatId, { 
                text: "🤔 You can't block yourself!",
                quoted: message 
            });
            return;
        }

        // Don't allow blocking the bot
        if (targetJid === botJid || targetJid.includes(botNumber)) {
            await sock.sendMessage(chatId, { 
                text: "🤖 You can't block the bot!",
                quoted: message 
            });
            return;
        }

        // Load this user's block list
        const blockList = loadUserBlockList(ownerId);

        // Check if already blocked
        if (blockList.users.includes(targetJid)) {
            await sock.sendMessage(chatId, { 
                text: "⚠️ This user is already in your block list.",
                quoted: message 
            });
            return;
        }

        // Show processing message
        await sock.sendMessage(chatId, { 
            text: "⏳ Processing block request...",
            quoted: message 
        });

        // Block the user
        try {
            // First, block via WhatsApp API (this blocks for the bot account globally)
            // But we'll also track in our per-user block list
            await sock.updateBlockStatus(targetJid, "block");
            
            // Add to this user's block list
            blockList.users.push(targetJid);
            saveUserBlockList(ownerId, blockList);
            
            const userNumber = targetJid.split('@')[0];
            
            await sock.sendMessage(chatId, { 
                text: `✅ *User Blocked For Your Session!*\n\n📱 Number: ${userNumber}\n🔒 Status: Blocked\n📅 Time: ${new Date().toLocaleString()}\n\n*Note:* This block is tracked for YOUR session.`,
                quoted: message 
            });
            
        } catch (blockError) {
            console.error("Block API error:", blockError);
            
            // Even if API fails, we can still add to our block list
            // This way we can at least prevent them from using commands
            if (!blockList.users.includes(targetJid)) {
                blockList.users.push(targetJid);
                saveUserBlockList(ownerId, blockList);
                
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *Added to your block list*\n\nUser: ${targetJid.split('@')[0]}\n\nNote: WhatsApp API block failed, but they've been added to your personal block list and won't be able to use commands in your session.`,
                    quoted: message 
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: "❌ Failed to block user via WhatsApp API. They may already be blocked or there's a server error.",
                    quoted: message 
                });
            }
        }

    } catch (error) {
        console.error("Block command error:", error);
        await sock.sendMessage(chatId, { 
            text: `❌ Error: ${error.message}`,
            quoted: message 
        });
    }
}

/**
 * Unblock a user (for unblock command)
 */
async function unblockUser(ownerId, targetJid) {
    try {
        const blockList = loadUserBlockList(ownerId);
        const index = blockList.users.indexOf(targetJid);
        
        if (index > -1) {
            blockList.users.splice(index, 1);
            saveUserBlockList(ownerId, blockList);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error unblocking user:', error);
        return false;
    }
}

/**
 * Get all blocked users for a specific owner
 */
function getBlockedUsers(ownerId) {
    const blockList = loadUserBlockList(ownerId);
    return blockList.users;
}

module.exports = blockCommand;
module.exports.isUserBlocked = isUserBlocked;
module.exports.loadUserBlockList = loadUserBlockList;
module.exports.unblockUser = unblockUser;
module.exports.getBlockedUsers = getBlockedUsers;
module.exports.clearUserCache = clearUserCache;