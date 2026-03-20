// lib/helper.js
const path = require('path');
const fs = require('fs');

function createContext(sender, options = {}) {
    const {
        title = "404-XMD",
        body = "Powered by NUCH",
        thumbnail = "https://files.catbox.moe/sd49da.jpg",
        mediaType = 0,
        mediaUrl = "",
        sourceUrl = "https://bwmxmd.online",
        renderLargerThumbnail = true,
        showAdAttribution = true,
        mentionedJid = [],
        forwardingScore = 999,
        isForwarded = true
    } = options;

    return {
        contextInfo: {
            mentionedJid: mentionedJid,
            forwardingScore: forwardingScore,
            isForwarded: isForwarded,
            externalAdReply: {
                title: title,
                body: body,
                thumbnailUrl: thumbnail,
                mediaType: mediaType,
                mediaUrl: mediaUrl,
                sourceUrl: sourceUrl,
                renderLargerThumbnail: renderLargerThumbnail,
                showAdAttribution: showAdAttribution
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363401269012709@newsletter",
                newsletterName: "404 XMD",
                serverMessageId: Math.floor(Math.random() * 1000000) + 100000
            }
        }
    };
}

function createContext2(sender, options = {}) {
    const {
        title = "404-XMD Audio",
        body = "Powered by NUCH",
        thumbnail = "https://files.catbox.moe/sd49da.jpg",
        sourceUrl = "https://bwmxmd.online"
    } = options;

    return {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                title: title,
                body: body,
                thumbnailUrl: thumbnail,
                sourceUrl: sourceUrl,
                mediaType: 2, // Audio
                renderLargerThumbnail: true,
                showAdAttribution: true
            },
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363401269012709@newsletter",
                newsletterName: "404 XMD",
                serverMessageId: Math.floor(Math.random() * 1000000) + 100000
            }
        }
    };
}

function standardizeJid(jid) {
    if (!jid) return '';
    try {
        jid = typeof jid === 'string' ? jid : 
             (jid.decodeJid ? jid.decodeJid() : String(jid));
        jid = jid.split(':')[0].split('/')[0];
        if (!jid.includes('@')) {
            jid += '@s.whatsapp.net';
        } else if (jid.endsWith('@lid')) {
            // Keep LID format for group participants
            return jid.toLowerCase();
        }
        return jid.toLowerCase();
    } catch (e) {
        console.error("JID standardization error:", e);
        return '';
    }
}

// Helper function for authentication
async function checkAuthentication(jid, store, isGroup = false) {
    if (!store) return false;
    
    const standardJid = standardizeJid(jid);
    
    // Check unauthorized attempts
    const attempts = store.unauthorizedAttempts?.get(standardJid) || [];
    if (attempts.length > 5) {
        const lastAttempt = attempts[attempts.length - 1];
        const now = Date.now();
        if (now - lastAttempt.timestamp < 300000) { // 5 minutes
            return false;
        }
    }
    
    return true;
}

module.exports = {
    createContext,
    createContext2,
    standardizeJid,
    checkAuthentication
};