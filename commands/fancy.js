const axios = require("axios");

// Local font generator - No external API needed!
const fontStyles = {
    "small caps": (text) => text.toUpperCase(),
    "fullwidth": (text) => text.replace(/[!-~]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)),
    "bubble": (text) => text.split('').map(c => {
        const map = { 'a':'ⓐ', 'b':'ⓑ', 'c':'ⓒ', 'd':'ⓓ', 'e':'ⓔ', 'f':'ⓕ', 'g':'ⓖ', 'h':'ⓗ', 'i':'ⓘ', 'j':'ⓙ', 'k':'ⓚ', 'l':'ⓛ', 'm':'ⓜ', 'n':'ⓝ', 'o':'ⓞ', 'p':'ⓟ', 'q':'ⓠ', 'r':'ⓡ', 's':'ⓢ', 't':'ⓣ', 'u':'ⓤ', 'v':'ⓥ', 'w':'ⓦ', 'x':'ⓧ', 'y':'ⓨ', 'z':'ⓩ' };
        const upperMap = { 'A':'Ⓐ', 'B':'Ⓑ', 'C':'Ⓒ', 'D':'Ⓓ', 'E':'Ⓔ', 'F':'Ⓕ', 'G':'Ⓖ', 'H':'Ⓗ', 'I':'Ⓘ', 'J':'Ⓙ', 'K':'Ⓚ', 'L':'Ⓛ', 'M':'Ⓜ', 'N':'Ⓝ', 'O':'Ⓞ', 'P':'Ⓟ', 'Q':'Ⓠ', 'R':'Ⓡ', 'S':'Ⓢ', 'T':'Ⓣ', 'U':'Ⓤ', 'V':'Ⓥ', 'W':'Ⓦ', 'X':'Ⓧ', 'Y':'Ⓨ', 'Z':'Ⓩ' };
        return map[c.toLowerCase()] || upperMap[c] || c;
    }).join(''),
    "double struck": (text) => text.split('').map(c => {
        const map = { 'a':'𝕒', 'b':'𝕓', 'c':'𝕔', 'd':'𝕕', 'e':'𝕖', 'f':'𝕗', 'g':'𝕘', 'h':'𝕙', 'i':'𝕚', 'j':'𝕛', 'k':'𝕜', 'l':'𝕝', 'm':'𝕞', 'n':'𝕟', 'o':'𝕠', 'p':'𝕡', 'q':'𝕢', 'r':'𝕣', 's':'𝕤', 't':'𝕥', 'u':'𝕦', 'v':'𝕧', 'w':'𝕨', 'x':'𝕩', 'y':'𝕪', 'z':'𝕫' };
        const upperMap = { 'A':'𝔸', 'B':'𝔹', 'C':'ℂ', 'D':'𝔻', 'E':'𝔼', 'F':'𝔽', 'G':'𝔾', 'H':'ℍ', 'I':'𝕀', 'J':'𝕁', 'K':'𝕂', 'L':'𝕃', 'M':'𝕄', 'N':'ℕ', 'O':'𝕆', 'P':'ℙ', 'Q':'ℚ', 'R':'ℝ', 'S':'𝕊', 'T':'𝕋', 'U':'𝕌', 'V':'𝕍', 'W':'𝕎', 'X':'𝕏', 'Y':'𝕐', 'Z':'ℤ' };
        return map[c.toLowerCase()] || upperMap[c] || c;
    }).join(''),
    "script": (text) => text.split('').map(c => {
        const map = { 'a':'𝒶', 'b':'𝒷', 'c':'𝒸', 'd':'𝒹', 'e':'𝑒', 'f':'𝒻', 'g':'𝑔', 'h':'𝒽', 'i':'𝒾', 'j':'𝒿', 'k':'𝓀', 'l':'𝓁', 'm':'𝓂', 'n':'𝓃', 'o':'𝑜', 'p':'𝓅', 'q':'𝓆', 'r':'𝓇', 's':'𝓈', 't':'𝓉', 'u':'𝓊', 'v':'𝓋', 'w':'𝓌', 'x':'𝓍', 'y':'𝓎', 'z':'𝓏' };
        const upperMap = { 'A':'𝒜', 'B':'ℬ', 'C':'𝒞', 'D':'𝒟', 'E':'ℰ', 'F':'ℱ', 'G':'𝒢', 'H':'ℋ', 'I':'ℐ', 'J':'𝒥', 'K':'𝒦', 'L':'ℒ', 'M':'ℳ', 'N':'𝒩', 'O':'𝒪', 'P':'𝒫', 'Q':'𝒬', 'R':'ℛ', 'S':'𝒮', 'T':'𝒯', 'U':'𝒰', 'V':'𝒱', 'W':'𝒲', 'X':'𝒳', 'Y':'𝒴', 'Z':'𝒵' };
        return map[c.toLowerCase()] || upperMap[c] || c;
    }).join(''),
    "monospace": (text) => text.split('').map(c => {
        const map = { 'a':'𝚊', 'b':'𝚋', 'c':'𝚌', 'd':'𝚍', 'e':'𝚎', 'f':'𝚏', 'g':'𝚐', 'h':'𝚑', 'i':'𝚒', 'j':'𝚓', 'k':'𝚔', 'l':'𝚕', 'm':'𝚖', 'n':'𝚗', 'o':'𝚘', 'p':'𝚙', 'q':'𝚚', 'r':'𝚛', 's':'𝚜', 't':'𝚝', 'u':'𝚞', 'v':'𝚟', 'w':'𝚠', 'x':'𝚡', 'y':'𝚢', 'z':'𝚣' };
        const upperMap = { 'A':'𝙰', 'B':'𝙱', 'C':'𝙲', 'D':'𝙳', 'E':'𝙴', 'F':'𝙵', 'G':'𝙶', 'H':'𝙷', 'I':'𝙸', 'J':'𝙹', 'K':'𝙺', 'L':'𝙻', 'M':'𝙼', 'N':'𝙽', 'O':'𝙾', 'P':'𝙿', 'Q':'𝚀', 'R':'𝚁', 'S':'𝚂', 'T':'𝚃', 'U':'𝚄', 'V':'𝚅', 'W':'𝚆', 'X':'𝚇', 'Y':'𝚈', 'Z':'𝚉' };
        return map[c.toLowerCase()] || upperMap[c] || c;
    }).join(''),
    "inverted": (text) => text.split('').map(c => {
        const map = { 'a':'ɐ', 'b':'q', 'c':'ɔ', 'd':'p', 'e':'ǝ', 'f':'ɟ', 'g':'ƃ', 'h':'ɥ', 'i':'ᴉ', 'j':'ɾ', 'k':'ʞ', 'l':'l', 'm':'ɯ', 'n':'u', 'o':'o', 'p':'d', 'q':'b', 'r':'ɹ', 's':'s', 't':'ʇ', 'u':'n', 'v':'ʌ', 'w':'ʍ', 'x':'x', 'y':'ʎ', 'z':'z' };
        const upperMap = { 'A':'∀', 'B':'𐐒', 'C':'Ɔ', 'D':'ᗡ', 'E':'Ǝ', 'F':'Ⅎ', 'G':'פ', 'H':'H', 'I':'I', 'J':'ſ', 'K':'ʞ', 'L':'˥', 'M':'W', 'N':'N', 'O':'O', 'P':'Ԁ', 'Q':'Ό', 'R':'ᴚ', 'S':'S', 'T':'⊥', 'U':'∩', 'V':'Λ', 'W':'M', 'X':'X', 'Y':'⅄', 'Z':'Z' };
        return map[c.toLowerCase()] || upperMap[c] || c;
    }).join('')
};

module.exports = {
    async fancy(sock, chatId, message, args) {
        try {
            const userMessage = message.message?.conversation?.trim() ||
                message.message?.extendedTextMessage?.text?.trim() || '';
            
            // Extract the text after ".fancy "
            const text = userMessage.replace('.fancy', '').replace('.font', '').replace('.style', '').trim();
            
            if (!text) {
                await sock.sendMessage(chatId, { 
                    text: "❎ Please provide text to convert into fancy fonts.\n\n*Example:* .fancy Hello\n*Example:* .fancy Hello World\n\n*Aliases:* .font, .style",
                    quoted: message 
                });
                return;
            }

            // Generate fonts locally
            const fontResults = [];
            
            for (const [name, converter] of Object.entries(fontStyles)) {
                try {
                    const converted = converter(text);
                    if (converted && converted !== text) {
                        fontResults.push({
                            name: name.charAt(0).toUpperCase() + name.slice(1),
                            result: converted
                        });
                    }
                } catch (err) {
                    console.log(`Skipping font ${name}:`, err.message);
                }
            }
            
            if (fontResults.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: "❌ Could not generate any fonts for the provided text.",
                    quoted: message 
                });
                return;
            }

            // Format the response
            const fonts = fontResults.map(item => `*${item.name}:*\n${item.result}`).join("\n\n");
            const resultText = `✨ *Fancy Fonts Converter* ✨\n\n${fonts}\n\n> *Powered By 404 XMD (Local Generator)*`;

            // Send the result
            await sock.sendMessage(chatId, { 
                text: resultText 
            }, { quoted: message });
            
        } catch (error) {
            console.error("❌ Error in fancy command:", error);
            
            let errorMsg = "⚠️ An error occurred while generating fonts.";
            
            if (error.response) {
                errorMsg = `⚠️ API Error (Status: ${error.response.status}).`;
            } else if (error.request) {
                errorMsg = "⚠️ Could not connect to the font service. The server might be down.";
            }
            
            await sock.sendMessage(chatId, { 
                text: errorMsg,
                quoted: message 
            });
        }
    }
};