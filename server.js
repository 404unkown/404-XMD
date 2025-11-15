
import express from "express";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { SESSION_ID } from "./config.js";

if (!SESSION_ID) {
    console.log("❌ SESSION_ID is missing! Add it in Render environment variables.");
    process.exit(1);
}

async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        browser: ["404-XMD", "Chrome", "4.0"],
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
            console.log("✅ 404-XMD BOT CONNECTED SUCCESSFULLY");
        }
        if (update.connection === "close") {
            console.log("❌ Connection closed — Reconnecting...");
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

        // ─── MENU ──────────────────────────────
        if (text.startsWith(".menu")) {
            const menu = `
🖤 *404-XMD BOT MENU* 🖤

✨ Available Commands:
• *.menu* – Show this menu
• *.ping* – Check bot status
• *.alive* – Check if bot is alive
• *.owner* – Owner contact

⭐ Bot Powered by 404-XMD
            `;
            await sock.sendMessage(from, { text: menu });
        }

        // ─── PING ─────────────────────────────
        if (text.startsWith(".ping")) {
            await sock.sendMessage(from, { text: "🏓 Pong! Bot is active." });
        }

        // ─── ALIVE ────────────────────────────
        if (text.startsWith(".alive")) {
            await sock.sendMessage(from, {
                text: "⚡ 404-XMD is ALIVE & running on Render!"
            });
        }

        // ─── OWNER ────────────────────────────
        if (text.startsWith(".owner")) {
            await sock.sendMessage(from, {
                text: "👑 Owner: 404 Unknown\n📞 +254769769295"
            });
        }
    });
}

connectBot();

// ─── RENDER WEB SERVER (keeps bot alive) ──────────────
const app = express();
app.get("/", (req, res) => res.send("404-XMD BOT RUNNING ✔"));
app.listen(3000, () => console.log("🌐 KEEP-ALIVE SERVER ON PORT 3000"));
