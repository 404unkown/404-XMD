const axios = require("axios");

async function apkCommand(sock, chatId, message, args) {
    try {
        // Check if the user provided an app name
        const appName = args.join(" ");
        if (!appName) {
            await sock.sendMessage(chatId, {
                text: 'Please provide an app name.\nExample: `.apk whatsapp`'
            }, { quoted: message });
            return;
        }

        // Add a reaction to indicate processing
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: message.key } 
        });

        // Prepare the NexOracle API URL
        const apiUrl = `https://api.nexoracle.com/downloader/apk`;
        const params = {
            apikey: 'free_key@maher_apis',
            q: appName,
        };

        // Call the NexOracle API using GET
        const response = await axios.get(apiUrl, { params });

        // Check if the API response is valid
        if (!response.data || response.data.status !== 200 || !response.data.result) {
            await sock.sendMessage(chatId, {
                text: '❌ Unable to find the APK. Please try again later.'
            }, { quoted: message });
            return;
        }

        // Extract the APK details
        const { name, lastup, package: packageName, size, icon, dllink } = response.data.result;

        // Send a message with the app thumbnail and "Downloading..." text
        await sock.sendMessage(chatId, {
            image: { url: icon },
            caption: `📦 *Downloading ${name}... Please wait.*`
        }, { quoted: message });

        // Download the APK file
        const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
        if (!apkResponse.data) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to download the APK. Please try again later.'
            }, { quoted: message });
            return;
        }

        // Prepare the APK file buffer
        const apkBuffer = Buffer.from(apkResponse.data, 'binary');

        // Prepare the message with APK details
        const apkMessage = `📦 *APK Details* 📦\n\n` +
            `🔖 *Name*: ${name}\n` +
            `📅 *Last Update*: ${lastup}\n` +
            `📦 *Package*: ${packageName}\n` +
            `📏 *Size*: ${size}\n\n` +
            `> © Powered by 404-XMD`;

        // Send the APK file as a document
        await sock.sendMessage(chatId, {
            document: apkBuffer,
            fileName: `${name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: apkMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Error in apkCommand:', error);
        await sock.sendMessage(chatId, {
            text: '❌ An error occurred while processing your request. Please try again later.'
        }, { quoted: message });
    }
}

module.exports = apkCommand;