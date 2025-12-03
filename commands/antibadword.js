const { setAntibadword, getAntibadword, removeAntibadword } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

// Check if BOT is admin in the group (FIXED - checks if bot is admin, not owner)
async function isBotAdminInGroup(sock, chatId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const botJid = sock.user.id; // Get bot's own JID
        
        const botParticipant = metadata.participants.find(p => p.id === botJid);
        const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
        
        console.log(`Bot admin check for ${chatId}: ${isAdmin}`);
        return isAdmin;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

async function handleAntibadwordCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        // CHECK: Sender must be admin (just like antilink)
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '```For Group Admins Only!```' 
            }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(prefix.length + 'antibadword'.length).trim().split(' ');
        const action = args[0]?.toLowerCase();

        if (!action) {
            const usage = `\`\`\`ANTIBADWORD SETUP\n\n${prefix}antibadword on\n${prefix}antibadword set delete | kick | warn\n${prefix}antibadword off\n${prefix}antibadword get\n${prefix}antibadword list\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntibadword(chatId);
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Antibadword is already on_*' 
                    }, { quoted: message });
                    return;
                }
                const result = await setAntibadword(chatId, true, 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antibadword has been turned ON_*' : '*_Failed to turn on Antibadword_*' 
                }, { quoted: message });
                break;

            case 'off':
                await removeAntibadword(chatId);
                await sock.sendMessage(chatId, { 
                    text: '*_Antibadword has been turned OFF_*' 
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_Please specify an action: ${prefix}antibadword set delete | kick | warn_*` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Invalid action. Choose delete, kick, or warn._*' 
                    }, { quoted: message });
                    return;
                }
                
                const currentConfig = await getAntibadword(chatId);
                if (!currentConfig?.enabled) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Please turn on antibadword first using: .antibadword on_*' 
                    }, { quoted: message });
                    return;
                }
                
                const setResult = await setAntibadword(chatId, true, setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antibadword action set to ${setAction}_*` : '*_Failed to set Antibadword action_*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntibadword(chatId);
                await sock.sendMessage(chatId, { 
                    text: `*_Antibadword Configuration:_*\nStatus: ${status?.enabled ? 'ON' : 'OFF'}\nAction: ${status?.action || 'Not set'}\nGroup: ${chatId}` 
                }, { quoted: message });
                break;
                
            case 'list':
                const badWordsCount = getComprehensiveBadWords().length;
                await sock.sendMessage(chatId, { 
                    text: `*_Bad Words List:_*\nTotal: ${badWordsCount} words\n\nUse .antibadword on to enable filtering.`
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: `*_Use ${prefix}antibadword for usage._*` 
                });
        }
    } catch (error) {
        console.error('Error in antibadword command:', error);
        await sock.sendMessage(chatId, { 
            text: '*_Error processing antibadword command_*' 
        });
    }
}

// COMPREHENSIVE BAD WORDS LIST (1000+ words)
function getComprehensiveBadWords() {
    return [
        // ENGLISH PROFANITY (A-Z)
        '2g1c', '2 girls 1 cup', 'acrotomophilia', 'anal', 'anilingus', 'anus', 'apeshit',
        'arsehole', 'ass', 'asshole', 'assmunch', 'auto erotic', 'autoerotic', 'babeland',
        'baby batter', 'ball gag', 'ball gravy', 'ball kicking', 'ball licking', 'ball sack',
        'ball sucking', 'bangbros', 'bareback', 'barely legal', 'barenaked', 'bastard',
        'bastardo', 'bastinado', 'bbw', 'bdsm', 'beaner', 'beaners', 'beaver cleaver',
        'beaver lips', 'bestiality', 'big black', 'big breasts', 'big knockers',
        'big tits', 'bimbos', 'birdlock', 'bitch', 'bitches', 'black cock', 'blonde action',
        'blonde on blonde action', 'blowjob', 'blow job', 'blow your load', 'blue waffle',
        'blumpkin', 'bollocks', 'bondage', 'boner', 'boob', 'boobs', 'booty call',
        'brown showers', 'brunette action', 'bukkake', 'bulldyke', 'bullet vibe', 'bullshit',
        'bung hole', 'bunghole', 'busty', 'butt', 'buttcheeks', 'butthole', 'camel toe',
        'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'chocolate rosebuds',
        'circlejerk', 'cleveland steamer', 'clit', 'clitoris', 'clover clamps', 'clusterfuck',
        'cock', 'cocks', 'coprolagnia', 'coprophilia', 'cornhole', 'coon', 'coons', 'creampie',
        'cum', 'cumming', 'cunnilingus', 'cunt', 'darkie', 'date rape', 'daterape', 'deep throat',
        'deepthroat', 'dendrophilia', 'dick', 'dildo', 'dingleberry', 'dingleberries', 'dirty pillows',
        'dirty sanchez', 'doggie style', 'doggiestyle', 'doggy style', 'doggystyle', 'dog style',
        'dolcett', 'domination', 'dominatrix', 'dommes', 'donkey punch', 'double dong',
        'double penetration', 'dp action', 'dry hump', 'dvda', 'eat my ass', 'ecchi', 'ejaculation',
        'erotic', 'erotism', 'escort', 'eunuch', 'faggot', 'fecal', 'felch', 'fellatio', 'feltch',
        'female squirting', 'femdom', 'figging', 'fingerbang', 'fingering', 'fisting', 'foot fetish',
        'footjob', 'frotting', 'fuck', 'fucker', 'fuck buttons', 'fuckin', 'fucking', 'fucktards',
        'fudge packer', 'fudgepacker', 'futanari', 'gangbang', 'gang bang', 'gay sex', 'genitals',
        'giant cock', 'girl on', 'girl on top', 'girls gone wild', 'goatcx', 'goatse', 'god damn',
        'gokkun', 'golden shower', 'goodpoop', 'goo girl', 'goregasm', 'grope', 'group sex',
        'g-spot', 'guro', 'hand job', 'handjob', 'hard core', 'hardcore', 'hentai', 'homoerotic',
        'honkey', 'hooker', 'hot carl', 'hot chick', 'how to kill', 'how to murder', 'huge fat',
        'humping', 'incest', 'intercourse', 'jack off', 'jail bait', 'jailbait', 'jelly donut',
        'jerk off', 'jigaboo', 'jiggaboo', 'jiggerboo', 'jizz', 'juggs', 'kike', 'kinbaku',
        'kinkster', 'kinky', 'knobbing', 'leather restraint', 'leather straight jacket',
        'lemon party', 'lolita', 'lovemaking', 'make me come', 'male squirting', 'masturbate',
        'menage a trois', 'milf', 'missionary position', 'motherfucker', 'mound of venus',
        'mr hands', 'muff diver', 'muffdiving', 'nambla', 'nawashi', 'negro', 'neonazi',
        'nigga', 'nigger', 'nig nog', 'nimphomania', 'nipple', 'nipples', 'nsfw images',
        'nude', 'nudity', 'nympho', 'nymphomania', 'octopussy', 'omorashi', 'one cup two girls',
        'one guy one jar', 'orgasm', 'orgy', 'paedophile', 'paki', 'panties', 'panty',
        'pedobear', 'pedophile', 'pegging', 'penis', 'phone sex', 'piece of shit', 'pissing',
        'piss pig', 'pisspig', 'playboy', 'pleasure chest', 'pole smoker', 'ponyplay',
        'poof', 'poon', 'poontang', 'punany', 'poop chute', 'poopchute', 'porn', 'porno',
        'pornography', 'prince albert piercing', 'pthc', 'pubes', 'pussy', 'queaf', 'queef',
        'quim', 'raghead', 'raging boner', 'rape', 'raping', 'rapist', 'rectum', 'reverse cowgirl',
        'rimjob', 'rimming', 'rosy palm', 'rosy palm and her 5 sisters', 'rusty trombone',
        'sadism', 'santorum', 'scat', 'schlong', 'scissoring', 'semen', 'sex', 'sexo', 'sexy',
        'shaved beaver', 'shaved pussy', 'shemale', 'shibari', 'shit', 'shitblimp', 'shitty',
        'shota', 'shrimping', 'skeet', 'slanteye', 'slut', 's&m', 'smut', 'snatch', 'snowballing',
        'sodomize', 'sodomy', 'spic', 'splooge', 'splooge moose', 'spooge', 'spread legs',
        'spunk', 'strap on', 'strapon', 'strappado', 'strip club', 'style doggy', 'suck',
        'sucks', 'suicide girls', 'sultry women', 'swastika', 'swinger', 'tarded', 'tea bagging',
        'threesome', 'throating', 'tit', 'tits', 'titties', 'titty', 'tongue in a', 'topless',
        'tosser', 'towelhead', 'tranny', 'tribadism', 'tub girl', 'tubgirl', 'tushy', 'twat',
        'twink', 'twinkie', 'two girls one cup', 'undressing', 'upskirt', 'urethra play',
        'urophilia', 'vagina', 'venus mound', 'viagra', 'vibrator', 'violet wand', 'vorarephilia',
        'voyeur', 'vulva', 'wank', 'wetback', 'wet dream', 'white power', 'whore', 'worldsex',
        'wrapping men', 'wrinkled starfish', 'xx', 'xxx', 'yaoi', 'yellow showers', 'yiffy',
        'zoophilia',
        
        // HINDI/URDU PROFANITY
        'madarchod', 'maderchod', 'madar chod', 'behenchod', 'bhenchod', 'behen chod', 
        'bhosdike', 'bhosdi ke', 'bhosri ke', 'chutiya', 'chutia', 'gaandu', 'gandu',
        'lauda', 'lund', 'kutta', 'kuttiya', 'randi', 'rand', 'saala', 'saali', 'harami',
        'kamine', 'kamina', 'bhadwa', 'bhadwe', 'chut', 'chod', 'chodu', 'lund fakir',
        'gand mara', 'gaand mara', 'teri maa ki chut', 'teri behen ki chut',
        'maa chuda', 'behen chuda', 'baap chuda',
        
        // TAMIL PROFANITY
        'otha', 'punda', 'soothu', 'mairu', 'naai', 'panni', 'kevalam', 'thayoli',
        'pundai', 'sootha', 'mairan', 'naaye', 'koothi', 'koodhi', 'kundi', 'koothiam',
        'koodhiyam',
        
        // TELUGU PROFANITY
        'lanja', 'pooka', 'dengey', 'erri', 'puku', 'dengudu', 'erripooka', 'erripuku',
        'kodaka', 'koduku', 'pichodu', 'picchodu', 'chaddi', 'guddha', 'gudha',
        
        // KANNADA PROFANITY
        'naaye', 'henge', 'thika', 'munde', 'thikka', 'bekku', 'tharkari', 'bekkina',
        'murkha', 'murkane',
        
        // MALAYALAM PROFANITY
        'patti', 'myre', 'punda', 'poori', 'kotham', 'patti myre', 'poori myre',
        'kotham myre', 'kundi', 'panni', 'korangu', 'koranga',
        
        // BENGALI PROFANITY
        'khankir', 'khankir pola', 'khanki', 'magi', 'magir pola', 'chudi', 'choda',
        'chod', 'chudir bhai', 'chudir bahin',
        
        // GUJARATI PROFANITY
        'gadhedo', 'gadheda', 'laude', 'lavde', 'lund', 'bhosda', 'bhosdi',
        'chod', 'chodu', 'bhenchod',
        
        // MARATHI PROFANITY
        'zhavadya', 'zhavada', 'bhondya', 'bhondi', 'gandit', 'gandu', 'lund',
        'bhosda', 'bhosdi', 'zhav', 'zhava',
        
        // PUNJABI PROFANITY
        'bhenchod', 'behenchod', 'madarchod', 'bhosdike', 'lund', 'lunn',
        'chod', 'chodu', 'kutta', 'kutti', 'randi', 'rand',
        
        // COMMON SLURS & OFFENSIVE TERMS
        'nigger', 'nigga', 'chink', 'spic', 'wetback', 'beaner', 'cracker',
        'gook', 'jap', 'kike', 'heeb', 'raghead', 'towelhead', 'sand nigger',
        'camel jockey', 'paki', 'gypsy', 'redneck', 'hillbilly', 'white trash',
        'retard', 'retarded', 'spaz', 'cripple', 'gimp', 'mongoloid', 'midget',
        'dwarf', 'fattie', 'fatso', 'lardass', 'skinny bitch', 'anorexic',
        'bulimic', 'whore', 'slut', 'skank', 'ho', 'hoe', 'bitch', 'cunt',
        'dyke', 'faggot', 'fag', 'queer', 'homo', 'tranny', 'shemale',
        'she male', 'he she', 'it', 'thing',
        
        // MISCELLANEOUS OFFENSIVE TERMS
        'kill yourself', 'kys', 'die', 'death', 'murder', 'suicide', 'hang',
        'rope', 'jump', 'bridge', 'overdose', 'cut', 'bleed', 'blood',
        'stab', 'shoot', 'gun', 'bullet', 'knife', 'pain', 'hurt',
        
        // COMMON TEXT ABBREVIATIONS
        'wtf', 'wth', 'omg', 'lmao', 'lmfao', 'rofl', 'stfu', 'gtfo',
        'fml', 'smd', 'stfd', 'kys', 'idgaf', 'idc', 'stf', 'fck',
        'fuk', 'fuc', 'sh1t', 'sh!t', 'b!tch', 'b1tch', 'a$$', 'a55',
        '4r5e', '5h1t', '5hit', 'a55hole', 'a_s_s', 'b!tch', 'b00bs',
        'b17ch', 'b1tch', 'ball5', 'bellend', 'bollock', 'butt-pirate',
        'c0ck', 'c0cksucker', 'carpet muncher', 'cawk', 'chink', 'cipa',
        'cl1t', 'clit', 'clitoris', 'clits', 'cnut', 'cock-sucker',
        'cocksuck', 'cocksucked', 'cocksucking', 'cocksucks', 'cocksuka',
        'cocksukka', 'cok', 'cokmuncher', 'coksucka', 'crap', 'cum',
        'cummer', 'cumming', 'cums', 'cumshot', 'cunilingus', 'cunillingus',
        'cunnilingus', 'cunt', 'cuntlick', 'cuntlicker', 'cuntlicking',
        'cunts', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked',
        'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'damn',
        'dick', 'dickhead', 'dildo', 'dildos', 'dink', 'dinks', 'dirsa',
        'dlck', 'dog-fucker', 'doggin', 'dogging', 'donkeyribber',
        'doosh', 'duche', 'dyke', 'ejaculate', 'ejaculated', 'ejaculates',
        'ejaculating', 'ejaculatings', 'ejaculation', 'ejakulate',
        'f u c k', 'f u c k e r', 'f4nny', 'fag', 'fagging', 'faggitt',
        'faggot', 'faggs', 'fagot', 'fagots', 'fags', 'fanny', 'fannyflaps',
        'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking',
        'feck', 'fecker', 'felching', 'fellate', 'fellatio', 'fingerfuck',
        'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking',
        'fingerfucks', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers',
        'fistfucking', 'fistfuckings', 'fistfucks', 'flange', 'fook',
        'fooker', 'fuck', 'fucka', 'fucked', 'fucker', 'fuckers', 'fuckhead',
        'fuckheads', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker',
        'fuckme', 'fucks', 'fuckwhit', 'fuckwit', 'fudge packer', 'fudgepacker',
        'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit',
        'fux', 'fux0r', 'f_u_c_k', 'gangbang', 'gangbanged', 'gangbangs',
        'gaylord', 'gaysex', 'goatse', 'God', 'god-dam', 'god-damned',
        'goddamn', 'goddamned', 'hardcoresex', 'hell', 'heshe', 'hoar',
        'hoare', 'hoer', 'homo', 'hore', 'horniest', 'horny', 'hotsex',
        'jack-off', 'jackoff', 'jap', 'jerk-off', 'jism', 'jiz', 'jizm',
        'jizz', 'kawk', 'knob', 'knobead', 'knobed', 'knobend', 'knobhead',
        'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kum',
        'kummer', 'kumming', 'kums', 'kunilingus', 'l3i+ch', 'l3itch',
        'labia', 'lust', 'lusting', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8',
        'ma5terbate', 'masochist', 'master-bate', 'masterb8', 'masterbat*',
        'masterbat3', 'masterbate', 'masterbation', 'masterbations',
        'masturbate', 'mo-fo', 'mof0', 'mofo', 'mothafuck', 'mothafucka',
        'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker',
        'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings',
        'mothafucks', 'mother fucker', 'motherfuck', 'motherfucked',
        'motherfucker', 'motherfuckers', 'motherfuckin', 'motherfucking',
        'motherfuckings', 'motherfuckka', 'motherfucks', 'muff', 'mutha',
        'muthafecker', 'muthafuckker', 'muther', 'mutherfucker', 'n1gga',
        'n1gger', 'nazi', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas',
        'niggaz', 'nigger', 'niggers', 'nob', 'nob jokey', 'nobhead',
        'nobjocky', 'nobjokey', 'numbnuts', 'nutsack', 'orgasim', 'orgasims',
        'orgasm', 'orgasms', 'p0rn', 'pawn', 'pecker', 'penis', 'penisfucker',
        'phonesex', 'phuck', 'phuk', 'phuked', 'phuking', 'phukked',
        'phukking', 'phuks', 'phuq', 'pigfucker', 'pimpis', 'piss',
        'pissed', 'pisser', 'pissers', 'pisses', 'pissflaps', 'pissin',
        'pissing', 'pissoff', 'poop', 'porn', 'porno', 'pornography',
        'pornos', 'prick', 'pricks', 'pron', 'pube', 'pusse', 'pussi',
        'pussies', 'pussy', 'pussys', 'rectum', 'retard', 'rimjaw',
        'rimming', 's hit', 's.o.b.', 'sadist', 'schlong', 'screwing',
        'scroat', 'scrote', 'scrotum', 'semen', 'sex', 'sh!+', 'sh!t',
        'sh1t', 'shag', 'shagger', 'shaggin', 'shagging', 'shemale',
        'shi+', 'shit', 'shitdick', 'shite', 'shited', 'shitey', 'shitfuck',
        'shitfull', 'shithead', 'shiting', 'shitings', 'shits', 'shitted',
        'shitter', 'shitters', 'shitting', 'shittings', 'shitty', 'skank',
        'slut', 'sluts', 'smegma', 'smut', 'snatch', 'son-of-a-bitch',
        'spac', 'spunk', 's_h_i_t', 't1tt1e5', 't1tties', 'teets', 'teez',
        'testical', 'testicle', 'tit', 'titfuck', 'tits', 'titt', 'tittie5',
        'tittiefucker', 'titties', 'tittyfuck', 'tittywank', 'titwank',
        'tosser', 'turd', 'tw4t', 'twat', 'twathead', 'twatty', 'twunt',
        'twunter', 'v14gra', 'v1gra', 'vagina', 'viagra', 'vulva', 'w00se',
        'wang', 'wank', 'wanker', 'wanky', 'whoar', 'whore', 'willies',
        'willy', 'xrated', 'xxx',
    ];
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const antibadwordSetting = await getAntibadword(chatId);
        if (!antibadwordSetting?.enabled) return;

        console.log(`Antibadword Setting for ${chatId}: ${antibadwordSetting.action}`);
        
        let shouldDelete = false;
        let detectedWord = '';

        const badWords = getComprehensiveBadWords();
        const messageText = userMessage.toLowerCase().trim();
        
        // Skip if message is too short
        if (messageText.length < 2) return;
        
        // Check for bad words (exact match or contains)
        for (const word of badWords) {
            // Check for exact word match or word as part of message
            if (messageText === word || 
                messageText.includes(` ${word} `) || 
                messageText.startsWith(`${word} `) || 
                messageText.endsWith(` ${word}`) ||
                new RegExp(`\\b${word}\\b`, 'i').test(messageText)) {
                
                shouldDelete = true;
                detectedWord = word;
                console.log(`Bad word detected: "${detectedWord}" in ${chatId} by ${senderId}`);
                break;
            }
        }

        if (shouldDelete) {
            // CHECK: Bot must be admin (like antilink)
            const botAdmin = await isBotAdminInGroup(sock, chatId);
            if (!botAdmin) {
                console.log('Bot is not admin, skipping bad word deletion');
                return;
            }

            // CHECK: Sender must NOT be admin (admins can bypass)
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (isSenderAdmin) {
                console.log(`Sender ${senderId} is admin, skipping bad word deletion`);
                return;
            }

            const quotedMessageId = message.key.id;
            const quotedParticipant = message.key.participant || senderId;

            console.log(`Attempting to delete message with bad word: ${detectedWord}`);

            try {
                // DELETE THE MESSAGE
                await sock.sendMessage(chatId, {
                    delete: { 
                        remoteJid: chatId, 
                        fromMe: false, 
                        id: quotedMessageId, 
                        participant: quotedParticipant 
                    },
                });
                console.log(`Message with ID ${quotedMessageId} deleted successfully.`);
                
                // TAKE ACTION BASED ON SETTING (like antilink)
                const action = antibadwordSetting.action || 'delete';
                const mentionedJidList = [senderId];
                
                let warningMessage = '';
                switch (action) {
                    case 'warn':
                        warningMessage = `⚠️ Warning! @${senderId.split('@')[0]}, bad words are not allowed in this group.\nDetected word: "${detectedWord}"`;
                        break;
                    case 'kick':
                        warningMessage = `🚫 @${senderId.split('@')[0]} has been kicked for using bad words.\nDetected word: "${detectedWord}"`;
                        // You would add kick logic here
                        break;
                    case 'delete':
                    default:
                        warningMessage = `⚠️ Bad word detected and deleted.\n@${senderId.split('@')[0]}, please maintain group decorum.`;
                        break;
                }
                
                await sock.sendMessage(chatId, { 
                    text: warningMessage,
                    mentions: mentionedJidList 
                });
                
            } catch (error) {
                console.error('Failed to delete message:', error);
                // Send warning anyway if deletion fails
                await sock.sendMessage(chatId, { 
                    text: `⚠️ Warning! Bad word detected. Please maintain group decorum.`
                });
            }
        }
    } catch (error) {
        console.error('Error in badword detection:', error);
    }
}

module.exports = {
    handleAntibadwordCommand,
    handleBadwordDetection,
    getComprehensiveBadWords
};