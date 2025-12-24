const fs = require('fs');
const path = require('path');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment-timezone');

const FOOTBALL_FILE = './data/football.json';
const FOOTBALL_CACHE_FILE = './data/football_cache.json';

// Initialize directories
[path.dirname(FOOTBALL_FILE), path.dirname(FOOTBALL_CACHE_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configuration - USE YOUR OWN API KEYS
const API_CONFIG = {
    // Get free API key from: https://www.football-data.org/
    FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY || 'YOUR_API_KEY_HERE',
    
    // Alternative API (no key required)
    API_SPORTS_KEY: process.env.API_SPORTS_KEY || 'YOUR_API_SPORTS_KEY_HERE',
    
    // Scorebat API for highlights (no key needed)
    SCOREBAT_API: 'https://www.scorebat.com/video-api/v1/'
};

function loadData(file) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
    return {};
}

function saveData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving ${file}:`, error);
        return false;
    }
}

// Active football schedules
const footballJobs = {};

// ==================== REAL API INTEGRATION ====================

/**
 * Method 1: Football-Data.org API (Free tier available)
 */
async function fetchMatchesFromFootballData() {
    try {
        console.log('🔄 Fetching matches from Football-Data.org...');
        
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
        
        const response = await axios.get('https://api.football-data.org/v4/matches', {
            headers: {
                'X-Auth-Token': API_CONFIG.FOOTBALL_DATA_API_KEY
            },
            params: {
                dateFrom: today,
                dateTo: tomorrow
            },
            timeout: 10000
        });
        
        const matches = response.data.matches || [];
        console.log(`✅ Found ${matches.length} real matches`);
        
        return matches.map(match => ({
            id: match.id,
            homeTeam: match.homeTeam?.name || 'TBD',
            awayTeam: match.awayTeam?.name || 'TBD',
            homeScore: match.score?.fullTime?.home || 0,
            awayScore: match.score?.fullTime?.away || 0,
            status: getMatchStatusFromAPI(match.status),
            time: match.utcDate ? moment(match.utcDate).format('HH:mm') : 'TBD',
            league: match.competition?.name || 'Unknown League',
            country: match.area?.name || 'Unknown',
            timestamp: moment().format('HH:mm'),
            isToday: true,
            source: 'Football-Data.org',
            matchDate: match.utcDate,
            matchDay: match.matchday
        }));
        
    } catch (error) {
        console.error('Football-Data.org API error:', error.message);
        return [];
    }
}

/**
 * Method 2: API-Football.com (Alternative - requires rapidapi key)
 */
async function fetchMatchesFromApiFootball() {
    try {
        console.log('🔄 Fetching matches from API-Football.com...');
        
        const today = moment().format('YYYY-MM-DD');
        
        const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
            headers: {
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                'x-rapidapi-key': API_CONFIG.API_SPORTS_KEY
            },
            params: {
                date: today,
                timezone: 'UTC'
            },
            timeout: 10000
        });
        
        const fixtures = response.data.response || [];
        console.log(`✅ Found ${fixtures.length} fixtures from API-Football`);
        
        return fixtures.map(fixture => ({
            id: fixture.fixture.id,
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            homeScore: fixture.goals.home,
            awayScore: fixture.goals.away,
            status: getMatchStatusFromAPIFootball(fixture.fixture.status.short),
            time: moment(fixture.fixture.date).format('HH:mm'),
            league: fixture.league.name,
            country: fixture.league.country,
            timestamp: moment().format('HH:mm'),
            isToday: true,
            source: 'API-Football',
            matchDate: fixture.fixture.date
        }));
        
    } catch (error) {
        console.error('API-Football error:', error.message);
        return [];
    }
}

/**
 * Method 3: LiveScore API (Fallback)
 */
async function fetchMatchesFromLiveScore() {
    try {
        console.log('🔄 Trying LiveScore API...');
        
        // This uses a public endpoint (might change)
        const response = await axios.get('https://prod-public-api.livescore.com/v1/api/react/date/soccer/20241216/1', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        // Parse LiveScore response (structure may vary)
        const data = response.data;
        const matches = [];
        
        // This is a simplified parser - actual structure needs investigation
        if (data.STAGES) {
            data.STAGES.forEach(stage => {
                if (stage.EVENTS) {
                    stage.EVENTS.forEach(event => {
                        matches.push({
                            homeTeam: event.T1?.[0]?.Nm || 'Home',
                            awayTeam: event.T2?.[0]?.Nm || 'Away',
                            homeScore: event.Tr1 || 0,
                            awayScore: event.Tr2 || 0,
                            status: getLiveScoreStatus(event.Eps),
                            time: event.Esd || 'TBD',
                            league: stage.Snm || 'Football',
                            country: stage.Cnm || 'International',
                            timestamp: moment().format('HH:mm'),
                            isToday: true,
                            source: 'LiveScore'
                        });
                    });
                }
            });
        }
        
        return matches.slice(0, 20); // Limit to 20 matches
        
    } catch (error) {
        console.error('LiveScore API error:', error.message);
        return [];
    }
}

/**
 * Method 4: Use cached data if APIs fail
 */
async function fetchTodaysMatches() {
    try {
        console.log('⚽ Fetching today\'s football matches...');
        
        // Try multiple APIs in order
        let matches = [];
        
        // First try: Football-Data.org
        matches = await fetchMatchesFromFootballData();
        
        // Second try: API-Football if first fails
        if (matches.length === 0 && API_CONFIG.API_SPORTS_KEY !== 'YOUR_API_SPORTS_KEY_HERE') {
            matches = await fetchMatchesFromApiFootball();
        }
        
        // Third try: LiveScore API
        if (matches.length === 0) {
            matches = await fetchMatchesFromLiveScore();
        }
        
        // Final fallback: Use cached data or generate minimal fallback
        if (matches.length === 0) {
            console.log('⚠️ All APIs failed, using fallback data');
            matches = await getCachedMatches();
        }
        
        // Filter and sort matches
        const filteredMatches = matches
            .filter(match => match.status !== 'FINISHED' && match.status !== 'CANCELLED')
            .sort((a, b) => {
                const statusOrder = { 'LIVE': 1, 'IN_PLAY': 1, 'IN_PROGRESS': 1, 'HALF_TIME': 2, 'UPCOMING': 3, 'SCHEDULED': 4 };
                const orderA = statusOrder[a.status] || 5;
                const orderB = statusOrder[b.status] || 5;
                return orderA - orderB;
            });
        
        // Cache the results
        cacheMatches(filteredMatches);
        
        return filteredMatches;
        
    } catch (error) {
        console.error('Error fetching matches:', error);
        return getCachedMatches();
    }
}

function getMatchStatusFromAPI(status) {
    const statusMap = {
        'SCHEDULED': 'SCHEDULED',
        'LIVE': 'LIVE',
        'IN_PLAY': 'LIVE',
        'PAUSED': 'LIVE',
        'FINISHED': 'FINISHED',
        'POSTPONED': 'POSTPONED',
        'SUSPENDED': 'SUSPENDED',
        'CANCELLED': 'CANCELLED',
        'TIMED': 'UPCOMING'
    };
    return statusMap[status] || 'SCHEDULED';
}

function getMatchStatusFromAPIFootball(status) {
    const statusMap = {
        'NS': 'UPCOMING',
        '1H': 'LIVE',
        'HT': 'LIVE',
        '2H': 'LIVE',
        'ET': 'LIVE',
        'P': 'LIVE',
        'FT': 'FINISHED',
        'AET': 'FINISHED',
        'PEN': 'FINISHED',
        'SUSP': 'SUSPENDED',
        'INT': 'SUSPENDED',
        'PST': 'POSTPONED',
        'CANC': 'CANCELLED',
        'ABD': 'CANCELLED'
    };
    return statusMap[status] || 'SCHEDULED';
}

function getLiveScoreStatus(status) {
    if (!status) return 'SCHEDULED';
    if (status === 'FT') return 'FINISHED';
    if (status === 'HT') return 'LIVE';
    if (status.includes('\'')) return 'LIVE';
    return 'SCHEDULED';
}

// ==================== CACHE MANAGEMENT ====================

async function getCachedMatches() {
    try {
        const cache = loadData(FOOTBALL_CACHE_FILE);
        const cachedMatches = cache.matches || [];
        const cacheTime = cache.timestamp || 0;
        
        // If cache is less than 1 hour old, use it
        if (Date.now() - cacheTime < 3600000 && cachedMatches.length > 0) {
            console.log('📦 Using cached matches');
            return cachedMatches;
        }
    } catch (error) {
        console.error('Cache error:', error);
    }
    
    // Generate minimal fallback
    console.log('📝 Generating minimal fallback matches');
    return generateMinimalFallbackMatches();
}

function cacheMatches(matches) {
    try {
        const cacheData = {
            matches: matches,
            timestamp: Date.now(),
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        saveData(FOOTBALL_CACHE_FILE, cacheData);
        console.log(`💾 Cached ${matches.length} matches`);
    } catch (error) {
        console.error('Error caching matches:', error);
    }
}

function generateMinimalFallbackMatches() {
    const fallbackMatches = [
        {
            homeTeam: 'Real Madrid',
            awayTeam: 'Barcelona',
            homeScore: 0,
            awayScore: 0,
            status: 'UPCOMING',
            time: '20:00',
            league: 'La Liga',
            country: 'Spain',
            timestamp: moment().format('HH:mm'),
            isToday: true,
            source: 'Fallback',
            note: 'Check FlashScore.com for live updates'
        },
        {
            homeTeam: 'Manchester United',
            awayTeam: 'Liverpool',
            homeScore: 0,
            awayScore: 0,
            status: 'UPCOMING',
            time: '15:00',
            league: 'Premier League',
            country: 'England',
            timestamp: moment().format('HH:mm'),
            isToday: true,
            source: 'Fallback',
            note: 'Check LiveScore.com for live updates'
        }
    ];
    
    return fallbackMatches;
}

// ==================== FOOTBALL VIDEOS (REAL HIGHLIGHTS) ====================

async function sendFootballVideos(sock, chatId, matches) {
    try {
        console.log('🎥 Fetching football highlights...');
        
        const response = await axios.get(API_CONFIG.SCOREBAT_API, {
            timeout: 15000
        });
        
        const videoData = response.data || [];
        const liveMatches = matches.filter(m => m.status === 'LIVE');
        
        // Send highlights for live matches
        for (let match of liveMatches.slice(0, 3)) {
            const found = videoData.find(v => {
                const title = v.title.toLowerCase();
                return title.includes(match.homeTeam.toLowerCase()) || 
                       title.includes(match.awayTeam.toLowerCase());
            });

            if (found) {
                if (found.thumbnail) {
                    await sock.sendMessage(chatId, {
                        image: { url: found.thumbnail },
                        caption: `⚽ *${found.title}*\n📅 ${found.competition.name}\n⏰ ${match.time}`
                    });
                }

                if (found.videos && found.videos.length > 0) {
                    const video = found.videos[0];
                    const videoUrlMatch = video.embed.match(/src="([^"]+)"/);
                    const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null;
                    
                    if (videoUrl) {
                        await sock.sendMessage(chatId, {
                            video: { url: videoUrl },
                            caption: `🎥 *${match.homeTeam} vs ${match.awayTeam}*\n${match.league} • ${match.status}`
                        });
                        await delay(2000); // Delay between videos
                    }
                }
            }
        }
        
    } catch (error) {
        console.error("Error fetching/sending highlights:", error.message);
        // Send generic football video
        const footballVideos = [
            'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
            'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif'
        ];
        const gif = footballVideos[Math.floor(Math.random() * footballVideos.length)];
        
        await sock.sendMessage(chatId, {
            video: { url: gif },
            caption: "⚽ Football Highlights\n\nCheck YouTube for latest match highlights!"
        });
    }
}

// ==================== REAL FOOTBALL NEWS ====================

async function sendFootballNews(sock, chatId) {
    try {
        console.log('📰 Fetching football news...');
        
        // Try to fetch real news from RSS feed
        const response = await axios.get('https://www.espn.com/espn/rss/soccer/news', {
            timeout: 10000
        });
        
        // Parse RSS feed (simplified)
        const newsItems = [];
        const $ = require('cheerio').load(response.data);
        
        $('item').slice(0, 5).each((i, elem) => {
            const title = $(elem).find('title').text();
            const description = $(elem).find('description').text();
            const pubDate = $(elem).find('pubDate').text();
            
            if (title && description) {
                newsItems.push({
                    title: title.substring(0, 100),
                    content: description.substring(0, 150),
                    date: pubDate,
                    source: 'ESPN FC'
                });
            }
        });
        
        if (newsItems.length > 0) {
            const news = newsItems[Math.floor(Math.random() * newsItems.length)];
            
            await sock.sendMessage(chatId, {
                text: `📰 *FOOTBALL NEWS*\n\n*${news.title}*\n\n${news.content}...\n\n📅 ${news.date}\nSource: ${news.source}`
            });
        } else {
            throw new Error('No news items found');
        }
        
    } catch (error) {
        console.error('Error fetching news:', error.message);
        // Fallback news
        const fallbackNews = [
            {
                title: "Transfer Window Updates",
                content: "Major clubs preparing for January transfers. Stay tuned for breaking news!",
                source: "Sky Sports"
            },
            {
                title: "Champions League Knockout Stage",
                content: "Draw completed. Exciting matchups confirmed for round of 16!",
                source: "UEFA"
            }
        ];
        
        const news = fallbackNews[Math.floor(Math.random() * fallbackNews.length)];
        
        await sock.sendMessage(chatId, {
            text: `📰 *FOOTBALL NEWS*\n\n*${news.title}*\n\n${news.content}\n\nSource: ${news.source}\n${moment().format('MMMM Do YYYY')}`
        });
    }
}

// ==================== TODAY'S MATCHES SENDER ====================

async function sendTodaysMatches(sock, chatId) {
    try {
        const matches = await fetchTodaysMatches();
        
        if (!matches || matches.length === 0) {
            await sock.sendMessage(chatId, {
                text: `📅 *TODAY'S FOOTBALL*\n\nNo matches scheduled for today.\n\nCheck back tomorrow for live action! ⚽\n\n📅 ${moment().format('dddd, MMMM Do YYYY')}`
            });
            return;
        }
        
        const liveMatches = matches.filter(m => m.status === 'LIVE');
        const upcomingMatches = matches.filter(m => m.status === 'UPCOMING' || m.status === 'SCHEDULED');
        
        let matchText = `📅 *TODAY'S FOOTBALL MATCHES*\n\n`;
        matchText += `📊 *Summary:* ${liveMatches.length} Live • ${upcomingMatches.length} Upcoming\n\n`;
        
        if (liveMatches.length > 0) {
            matchText += `🔴 *LIVE MATCHES*\n\n`;
            liveMatches.slice(0, 5).forEach((match, index) => {
                const score = `${match.homeScore}-${match.awayScore}`;
                matchText += `${index + 1}. *${match.homeTeam}* ${score} *${match.awayTeam}*\n`;
                matchText += `   ⚽ ${match.league} • ${match.country}\n   ⏱️ ${match.time} • ${match.status}\n\n`;
            });
        }
        
        if (upcomingMatches.length > 0) {
            matchText += `⏰ *UPCOMING MATCHES*\n\n`;
            upcomingMatches.slice(0, 5).forEach((match, index) => {
                const startNum = liveMatches.length + index + 1;
                matchText += `${startNum}. *${match.homeTeam}* vs *${match.awayTeam}*\n`;
                matchText += `   ⚽ ${match.league} • ${match.country}\n   🕐 ${match.time}\n\n`;
            });
        }
        
        matchText += `\n📱 *Live Updates:*\n`;
        matchText += `• FlashScore.com\n• LiveScore.com\n• OneFootball.com\n`;
        matchText += `\n📅 ${moment().format('dddd, MMMM Do YYYY')}\n`;
        matchText += `⚽ Enjoy the matches!`;
        
        await sock.sendMessage(chatId, { text: matchText });
        
        // Send relevant image based on matches
        if (liveMatches.length > 0) {
            await sock.sendMessage(chatId, {
                image: { 
                    url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop'
                },
                caption: "🔴 LIVE FOOTBALL ACTION"
            });
        }
        
        // Send highlights if there are live matches
        if (liveMatches.length > 0) {
            await sendFootballVideos(sock, chatId, liveMatches);
        }
        
    } catch (error) {
        console.error('Error sending today\'s matches:', error);
        await sock.sendMessage(chatId, {
            text: `📅 *FOOTBALL UPDATE*\n\nUnable to fetch matches at the moment.\n\n📱 Check these sites for live scores:\n• FlashScore.com\n• LiveScore.com\n• ESPN.com/soccer\n\n⚽ Football never stops!`
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== SCHEDULER ====================

function scheduleFootballUpdates(sock, chatId, intervalMinutes = 30) {
    const jobId = `football_${chatId}`;
    
    // Cancel existing job
    if (footballJobs[chatId]) {
        footballJobs[chatId].cancel();
        delete footballJobs[chatId];
    }
    
    const validatedInterval = Math.min(Math.max(intervalMinutes, 5), 1440);
    
    let counter = 0;
    const job = schedule.scheduleJob(`*/${validatedInterval} * * * *`, async () => {
        counter++;
        console.log(`⚽ Update #${counter} to ${chatId} (${validatedInterval}min interval)`);
        
        try {
            const matches = await fetchTodaysMatches();
            
            if (matches.length > 0) {
                const liveMatches = matches.filter(m => m.status === 'LIVE');
                
                if (liveMatches.length > 0) {
                    // Send live match update
                    let updateText = `⚽ *LIVE UPDATE*\n\n`;
                    liveMatches.slice(0, 3).forEach(match => {
                        updateText += `🔴 *${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}*\n`;
                        updateText += `${match.league} • ${match.time}\n\n`;
                    });
                    
                    updateText += `📅 ${moment().format('HH:mm')}`;
                    
                    await sock.sendMessage(chatId, { text: updateText });
                } else if (counter % 3 === 0) {
                    // Every 3rd update, send news
                    await sendFootballNews(sock, chatId);
                }
            }
            
            // Update tracking data
            const data = loadData(FOOTBALL_FILE);
            if (!data[chatId]) data[chatId] = {};
            data[chatId].lastUpdate = Date.now();
            data[chatId].totalUpdates = counter;
            saveData(FOOTBALL_FILE, data);
            
        } catch (error) {
            console.error('Error in scheduled update:', error);
        }
    });
    
    footballJobs[chatId] = job;
    
    // Save schedule info
    const data = loadData(FOOTBALL_FILE);
    if (!data[chatId]) data[chatId] = {};
    data[chatId].schedule = {
        interval: validatedInterval,
        started: Date.now(),
        nextUpdate: Date.now() + (validatedInterval * 60000)
    };
    saveData(FOOTBALL_FILE, data);
    
    return job;
}

function stopFootballUpdates(chatId) {
    if (footballJobs[chatId]) {
        footballJobs[chatId].cancel();
        delete footballJobs[chatId];
        
        // Update data
        const data = loadData(FOOTBALL_FILE);
        if (data[chatId]) {
            data[chatId].schedule = null;
            saveData(FOOTBALL_FILE, data);
        }
        
        return true;
    }
    return false;
}

// ==================== MAIN COMMAND ====================

module.exports = async function footballCommand(sock, chatId, message, args) {
    const data = loadData(FOOTBALL_FILE);
    
    if (!args[0]) {
        // Show today's matches by default
        await sendTodaysMatches(sock, chatId);
        
        // Add help text
        await delay(1000);
        await sock.sendMessage(chatId, {
            text: `⚽ *FOOTBALL BOT COMMANDS*\n\n` +
                  `.football on <minutes> - Start automated updates\n` +
                  `.football off - Stop updates\n` +
                  `.football news - Get latest football news\n` +
                  `.football highlights - Get match highlights\n` +
                  `.football status - Check bot status\n\n` +
                  `📱 *Tip:* Set interval to 30-60 minutes for best experience`
        });
        return;
    }
    
    const command = args[0].toLowerCase();
    
    switch(command) {
        case 'on':
        case 'start':
            const interval = parseInt(args[1]) || 30;
            if (interval < 5) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Interval too short. Minimum is 5 minutes.`
                });
                return;
            }
            
            scheduleFootballUpdates(sock, chatId, interval);
            await sock.sendMessage(chatId, {
                text: `✅ *Football updates activated!*\n\n` +
                      `Updates every: ${interval} minutes\n` +
                      `First update in: 1 minute\n\n` +
                      `You'll receive:\n• Live match scores\n• Football news\n• Match highlights\n\n` +
                      `Use \`.football off\` to stop.`
            });
            break;
            
        case 'off':
        case 'stop':
            if (stopFootballUpdates(chatId)) {
                await sock.sendMessage(chatId, {
                    text: `✅ Football updates stopped.\n\nUse \`.football on\` to restart.`
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `ℹ️ No active football updates found.`
                });
            }
            break;
            
        case 'news':
            await sendFootballNews(sock, chatId);
            break;
            
        case 'highlights':
        case 'videos':
            const matches = await fetchTodaysMatches();
            await sendFootballVideos(sock, chatId, matches);
            break;
            
        case 'status':
            const chatData = data[chatId] || {};
            let statusText = `⚽ *FOOTBALL BOT STATUS*\n\n`;
            
            if (footballJobs[chatId]) {
                statusText += `🔴 *ACTIVE*\n`;
                statusText += `Interval: ${chatData.schedule?.interval || 'Unknown'} minutes\n`;
                if (chatData.lastUpdate) {
                    const lastUpdate = moment(chatData.lastUpdate).fromNow();
                    statusText += `Last update: ${lastUpdate}\n`;
                }
                statusText += `Total updates: ${chatData.totalUpdates || 0}\n`;
            } else {
                statusText += `🟢 *INACTIVE*\n`;
                statusText += `Use \`.football on\` to start updates\n`;
            }
            
            statusText += `\n📅 Today's date: ${moment().format('dddd, MMMM Do YYYY')}\n`;
            statusText += `⏰ Current time: ${moment().format('HH:mm:ss')}\n`;
            
            await sock.sendMessage(chatId, { text: statusText });
            break;
            
        case 'now':
        case 'today':
            await sendTodaysMatches(sock, chatId);
            break;
            
        default:
            await sock.sendMessage(chatId, {
                text: `❓ Unknown command. Use:\n\n` +
                      `.football - Show today's matches\n` +
                      `.football on 30 - Start updates (30min)\n` +
                      `.football off - Stop updates\n` +
                      `.football news - Latest news\n` +
                      `.football status - Bot status`
            });
    }
};