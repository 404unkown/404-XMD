import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";

// Ensure session folder exists
const sessionDir = "./session";
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: state,
        browser: ["404-XMD", "Chrome", "4.0"],
        printQRInTerminal: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
            console.log("✅ BOT CONNECTED: 404-XMD is online.");
        }

        if (update.connection === "close") {
            console.log("❌ Connection lost — reconnecting…");
            connectBot();
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        if (text.startsWith(".menu")) {
            await sock.sendMessage(from, {
                text: `🖤 *404-XMD MENU* 🖤

• *.menu*
• *.ping*
• *.alive*
• *.owner*
`
            });
        }

        if (text.startsWith(".ping")) {
            await sock.sendMessage(from, { text: "🏓 Pong!" });
        }

        if (text.startsWith(".alive")) {
            await sock.sendMessage(from, { text: "⚡ 404-XMD is alive." });
        }

        if (text.startsWith(".owner")) {
            await sock.sendMessage(from, {
                text: "👑 Owner: 404 Unknown\n📞 +254769769295"
            });
        }
    });
}

connectBot();

// Keep-alive server
const app = express();
app.get("/", (req, res) => res.send("404-XMD bot running."));
app.listen(3000);
