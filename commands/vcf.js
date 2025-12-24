const fs = require('fs');
const path = require('path');

async function vcfCommand(sock, chatId, message) {
    try {
        // Check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        
        // Validate group size
        if (participants.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Group must have at least 2 members',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }
        
        if (participants.length > 1000) {
            await sock.sendMessage(chatId, {
                text: '❌ Group is too large (max 1000 members)',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Check if user is admin (optional - you can remove this if you want anyone to use it)
        const senderId = message.key.participant || message.key.remoteJid;
        const isAdmin = require('../lib/isAdmin');
        const adminStatus = await isAdmin(sock, chatId, senderId);
        
        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ Only group admins can use this command!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363401269012709@newsletter',
                        newsletterName: '404 XMD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Show processing message
        await sock.sendMessage(chatId, {
            text: `📇 Generating VCF file for ${participants.length} members...`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Generate VCF content
        let vcfContent = '';
        participants.forEach(participant => {
            const phoneNumber = participant.id.split('@')[0];
            const displayName = participant.notify || `User_${phoneNumber}`;
            
            // Clean display name for VCF format
            const cleanName = displayName.replace(/[^\x20-\x7E]/g, '').trim() || `User_${phoneNumber}`;
            
            vcfContent += `BEGIN:VCARD\n` +
                          `VERSION:3.0\n` +
                          `FN:${cleanName}\n` +
                          `TEL;TYPE=CELL:+${phoneNumber}\n` +
                          `NOTE:From ${groupMetadata.subject}\n` +
                          `END:VCARD\n\n`;
        });

        // Create temp file
        const sanitizedGroupName = groupMetadata.subject.replace(/[^\w\s-]/g, '_').replace(/\s+/g, '_');
        const tempDir = path.join(__dirname, '..', 'temp');
        
        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const vcfPath = path.join(tempDir, `${sanitizedGroupName}_${Date.now()}.vcf`);
        fs.writeFileSync(vcfPath, vcfContent, 'utf8');

        // Send VCF file
        await sock.sendMessage(chatId, {
            document: { url: vcfPath },
            mimetype: 'text/vcard',
            fileName: `${sanitizedGroupName}_contacts.vcf`,
            caption: `📇 *Group Contacts*\n\n` +
                     `• Group: ${groupMetadata.subject}\n` +
                     `• Members: ${participants.length}\n` +
                     `• Generated: ${new Date().toLocaleString()}\n\n` +
                     `📥 *Import Instructions:*\n` +
                     `1. Download this file\n` +
                     `2. Open your contacts app\n` +
                     `3. Import from VCF file`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

        // Cleanup after 5 seconds
        setTimeout(() => {
            if (fs.existsSync(vcfPath)) {
                fs.unlinkSync(vcfPath);
            }
        }, 5000);

    } catch (error) {
        console.error('VCF Error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to generate VCF file. Please try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401269012709@newsletter',
                    newsletterName: '404 XMD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = {
    vcfCommand
};