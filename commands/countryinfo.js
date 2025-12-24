// /commands/countryinfo.js - Detailed country information
const axios = require('axios');

function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "🏳️";
    return countryCode
        .toUpperCase()
        .split('')
        .map(letter => String.fromCodePoint(letter.charCodeAt(0) + 127397))
        .join('');
}

module.exports = async function countryinfoCommand(sock, chatId, message, args = []) {
    try {
        const text = message.message?.conversation?.trim() ||
                     message.message?.extendedTextMessage?.text?.trim() ||
                     '';
        
        let query;
        if (args.length > 0) {
            query = args.join(' ').trim();
        } else {
            query = text.split(' ').slice(1).join(' ').trim();
        }
        
        if (!query) {
            const helpText = `
╭─❖ *🌍 COUNTRY INFORMATION* ❖─
│
├─ *Usage:* .country <name/code>
├─ *Examples:*
│  ├─ .country USA
│  ├─ .country Japan
│  ├─ .country IN (India code)
│  ├─ .country 44 (UK code)
│  └─ .country Germany
│
├─ *Information includes:*
│  ├─ Basic details
│  ├─ Capital & region
│  ├─ Population & area
│  ├─ Currency & languages
│  ├─ Timezones
│  └─ Flag & calling codes
│
╰─➤ _Get detailed country information_
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: helpText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
            return;
        }
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: '*🌍 Searching for country information...*',
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });
        
        try {
            // Try to get country by name or code
            let response;
            
            if (/^\d+$/.test(query)) {
                // Search by numeric country code
                const countries = await axios.get('https://restcountries.com/v3.1/all');
                const country = countries.data.find(c => {
                    return c.idd && c.idd.root && query === c.idd.root.replace('+', '');
                });
                
                if (country) {
                    response = { data: [country] };
                } else {
                    // Try v2 API
                    const v2Countries = await axios.get('https://restcountries.com/v2/all');
                    const v2Country = v2Countries.data.find(c => 
                        c.callingCodes && c.callingCodes.includes(query)
                    );
                    
                    if (v2Country) {
                        response = { data: [v2Country] };
                    }
                }
            } else {
                // Search by name or alpha code
                try {
                    response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
                } catch (error) {
                    // Try by alpha code
                    response = await axios.get(`https://restcountries.com/v3.1/alpha/${query.toUpperCase()}`);
                }
            }
            
            if (!response || !response.data || response.data.length === 0) {
                await sock.sendMessage(chatId, {
                    text: `*❌ Country not found*\n"${query}" not found in database.\n\nTry:\n• Full country name\n• 2-letter code (US, IN, GB)\n• Calling code (.check 44)`,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: message });
                return;
            }
            
            const country = response.data[0];
            
            // Format country information
            const flag = getFlagEmoji(country.cca2);
            const name = country.name?.common || 'Unknown';
            const nativeName = country.name?.nativeName 
                ? Object.values(country.name.nativeName)[0].common 
                : name;
            
            const countryInfo = `
${flag} *${name}* (${nativeName})
${country.cca2 ? `📌 *Code:* ${country.cca2}${country.cca3 ? ` / ${country.cca3}` : ''}` : ''}
${country.idd?.root ? `📞 *Calling Code:* ${country.idd.root}${country.idd.suffixes?.[0] || ''}` : ''}
${country.capital?.[0] ? `🏛️ *Capital:* ${country.capital[0]}` : ''}
${country.region ? `🗺️ *Region:* ${country.region}${country.subregion ? ` (${country.subregion})` : ''}` : ''}

*📊 Demographics:*
👥 *Population:* ${new Intl.NumberFormat().format(country.population || 0)}
📏 *Area:* ${new Intl.NumberFormat().format(Math.round(country.area || 0))} km²
📍 *Coordinates:* ${country.latlng?.join(', ') || 'N/A'}

*💰 Economy:*
${country.currencies ? `💵 *Currencies:* ${Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ')}` : ''}
${country.gini ? `📈 *Gini Index:* ${Object.values(country.gini)[0]}` : ''}

*🌐 Languages & Culture:*
${country.languages ? `🗣️ *Languages:* ${Object.values(country.languages).join(', ')}` : ''}
${country.demonyms?.eng?.m ? `👨 *Demonym:* ${country.demonyms.eng.m}` : ''}

*🕐 Time & Borders:*
${country.timezones ? `⏰ *Timezones:* ${country.timezones.slice(0, 3).join(', ')}` : ''}
${country.borders ? `🔗 *Borders:* ${country.borders.slice(0, 5).join(', ')}${country.borders.length > 5 ? '...' : ''}` : ''}
${country.startOfWeek ? `📅 *Week starts:* ${country.startOfWeek}` : ''}

*🎌 Additional Info:*
${country.tld?.[0] ? `🌐 *Domain:* ${country.tld[0]}` : ''}
${country.car?.side ? `🚗 *Drives on:* ${country.car.side} side` : ''}
${country.independent !== undefined ? `🏳️ *Independent:* ${country.independent ? 'Yes' : 'No'}` : ''}
${country.unMember !== undefined ? `🇺🇳 *UN Member:* ${country.unMember ? 'Yes' : 'No'}` : ''}
            `.trim();
            
            await sock.sendMessage(chatId, {
                text: countryInfo,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420656466131@newsletter',
                        newsletterName: 'Country Information',
                        serverMessageId: 151
                    }
                }
            }, { quoted: message });
            
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });
            
        } catch (error) {
            console.error('Country info error:', error);
            await sock.sendMessage(chatId, {
                text: `*❌ Failed to fetch country information*\nError: ${error.message}`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Countryinfo command error:', error);
        await sock.sendMessage(chatId, {
            text: `*❌ Unexpected error*\n${error.message}`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: message });
    }
};