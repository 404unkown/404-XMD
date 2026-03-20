// === groupevents.js ===
const { isJidGroup } = require('@whiskeysockets/baileys');

const defaultProfilePics = [
  'https://files.catbox.moe/r3elaj.png',
  'https://files.catbox.moe/lgj3y5.jpeg',
  'https://files.catbox.moe/as1zl1.png',
];

// Newsletter context (for forwarded-style look)
const getContextInfo = (mentionedJids) => ({
  mentionedJid: mentionedJids,
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363401269012709@newsletter',
    newsletterName: "cyber - ",
    serverMessageId: 200,
  },
});

module.exports = async (conn, update) => {
  try {
    const { id, participants, action } = update;
    if (!id || !isJidGroup(id) || !participants) return;

    const groupMetadata = await conn.groupMetadata(id);
    const groupName = groupMetadata.subject || "Group";
    const desc = groupMetadata.desc || "No Description available.";
    const groupMembersCount = groupMetadata.participants?.length || 0;
    const timestamp = new Date().toLocaleString();

    for (const participant of participants) {
      const userName = participant.split("@")[0];

      // Try to fetch profile picture
      let userPpUrl;
      try {
        userPpUrl = await conn.profilePictureUrl(participant, "image");
      } catch {
        userPpUrl = defaultProfilePics[Math.floor(Math.random() * defaultProfilePics.length)];
      }

      // === WELCOME ===
      if (action === "add") {
        const welcomeText = `
╭───❖ 🎒 *WELCOME HOMIE* ❖───
│ 👋 Hey @${userName}!
│ 🏠 Welcome to: *${groupName}*
│ 🔢 Member #: *${groupMembersCount}*
│ 🕒 Joined: *${timestamp}*
│ 
│ 📝 Group Description:
│ ${desc}
│ 
╰❖ Powered by *cyberdark* ❖─
        `.trim();

        await conn.sendMessage(id, {
          image: { url: userPpUrl },
          caption: welcomeText,
          mentions: [participant],
          contextInfo: getContextInfo([participant]),
        });
      }

      // === GOODBYE ===
      else if (action === "remove") {
        const goodbyeText = `
╭───❖ 😢 *GOODBYE* ❖───
│ 👋 bye bye@${userName}!
│ 🏠 You left: *${groupName}*
│ 🕒 Time: *${timestamp}*
│ 
╰❖ Powered by *cyberdark* ❖─
        `.trim();

        await conn.sendMessage(id, {
          image: { url: userPpUrl },
          caption: goodbyeText,
          mentions: [participant],
          contextInfo: getContextInfo([participant]),
        });
      }
    }
  } catch (err) {
    console.error("GroupEvents error:", err);
  }
};
