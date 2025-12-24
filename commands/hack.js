const fs = require('fs');
const path = require('path');
const axios = require('axios');
const schedule = require('node-schedule');
const cheerio = require('cheerio');

// Install: npm install node-schedule axios cheerio

const hack_FILE = './data/hack.json';
const CACHE_FILE = './data/hack_cache.json';
const GITHUB_CACHE_FILE = './data/github_cache.json';

// Initialize directories
[path.dirname(hack_FILE), path.dirname(CACHE_FILE), path.dirname(GITHUB_CACHE_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

// ==================== GITHUB TOOLS FETCHER ====================
async function fetchGitHubHackingTools() {
    const cache = loadData(GITHUB_CACHE_FILE);
    const now = Date.now();
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
    
    // Check cache first
    if (cache.tools && cache.timestamp && (now - cache.timestamp < CACHE_DURATION)) {
        console.log('📦 Using cached GitHub tools');
        return cache.tools;
    }
    
    console.log('🔄 Fetching fresh tools from GitHub...');
    
    const searchQueries = [
        'termux hacking tools',
        'penetration-testing-tool termux',
        'ethical-hacking termux',
        'cybersecurity-tools',
        'kali-linux-tools termux',
        'mobile-pentest termux',
        'android-hacking termux',
        'network-security termux',
        'web-security-tools',
        'vulnerability-scanner termux'
    ];
    
    const tools = [];
    
    try {
        for (const query of searchQueries.slice(0, 5)) { // Limit to 5 queries
            try {
                const response = await axios.get(
                    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=10`,
                    {
                        headers: {
                            'User-Agent': 'Cybersecurity-Bot',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        timeout: 10000
                    }
                );
                
                if (response.data.items) {
                    for (const repo of response.data.items) {
                        // Filter out non-relevant repos
                        if (repo.description && (
                            repo.description.toLowerCase().includes('termux') ||
                            repo.description.toLowerCase().includes('hack') ||
                            repo.description.toLowerCase().includes('security') ||
                            repo.description.toLowerCase().includes('pentest') ||
                            repo.description.toLowerCase().includes('exploit') ||
                            repo.description.toLowerCase().includes('scan') ||
                            repo.description.toLowerCase().includes('crack') ||
                            repo.name.toLowerCase().includes('termux') ||
                            repo.name.toLowerCase().includes('hack')
                        )) {
                            tools.push({
                                name: repo.name,
                                full_name: repo.full_name,
                                description: repo.description || 'No description',
                                url: repo.html_url,
                                stars: repo.stargazers_count,
                                forks: repo.forks_count,
                                updated: repo.updated_at,
                                language: repo.language,
                                install: `git clone ${repo.clone_url}`,
                                category: determineCategory(repo)
                            });
                        }
                    }
                }
                
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`Query "${query}" failed:`, error.message);
                continue;
            }
        }
        
        // Remove duplicates
        const uniqueTools = Array.from(new Map(tools.map(tool => [tool.url, tool])).values());
        
        // Cache results
        cache.tools = uniqueTools.slice(0, 50); // Keep top 50
        cache.timestamp = now;
        saveData(GITHUB_CACHE_FILE, cache);
        
        console.log(`✅ Fetched ${uniqueTools.length} tools from GitHub`);
        return uniqueTools;
        
    } catch (error) {
        console.error('Error fetching GitHub tools:', error);
        return cache.tools || []; // Return cached if available
    }
}

function determineCategory(repo) {
    const desc = (repo.description || '').toLowerCase();
    const name = repo.name.toLowerCase();
    
    if (desc.includes('sql') || desc.includes('injection') || desc.includes('web')) return 'Web Hacking';
    if (desc.includes('wifi') || desc.includes('wireless') || desc.includes('aircrack')) return 'Wireless Hacking';
    if (desc.includes('password') || desc.includes('crack') || desc.includes('hash')) return 'Password Attacks';
    if (desc.includes('scan') || desc.includes('nmap') || desc.includes('recon')) return 'Reconnaissance';
    if (desc.includes('exploit') || desc.includes('metasploit') || desc.includes('vulnerability')) return 'Exploitation';
    if (desc.includes('phish') || desc.includes('social') || desc.includes('engineering')) return 'Social Engineering';
    if (desc.includes('ddos') || desc.includes('stress') || desc.includes('dos')) return 'Stress Testing';
    if (desc.includes('android') || desc.includes('mobile') || desc.includes('app')) return 'Mobile Security';
    if (desc.includes('network') || desc.includes('packet') || desc.includes('sniff')) return 'Network Analysis';
    
    return 'General Hacking';
}

// ==================== NEWS FETCHER ====================
async function fetchLatestHackingNews() {
    const cache = loadData(CACHE_FILE);
    const now = Date.now();
    const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    
    if (cache.news && cache.newsTimestamp && (now - cache.newsTimestamp < NEWS_CACHE_DURATION)) {
        console.log('📰 Using cached news');
        return cache.news;
    }
    
    console.log('🔄 Fetching fresh hacking news...');
    
    const newsSources = [
        // RSS Feed Sources
        {
            name: "The Hacker News",
            url: "https://thehackernews.com/",
            type: "scrape",
            selector: ".home-title",
            linkSelector: ".story-link"
        },
        {
            name: "BleepingComputer",
            url: "https://www.bleepingcomputer.com/",
            type: "scrape",
            selector: ".bc_latest_news_text h4",
            linkSelector: "a"
        },
        {
            name: "Dark Reading",
            url: "https://www.darkreading.com/",
            type: "scrape",
            selector: ".featured-article__title",
            linkSelector: "a"
        },
        // API Sources
        {
            name: "Cybersecurity News API",
            url: "https://api.currentsapi.services/v1/latest-news?language=en&category=technology",
            type: "api",
            apiKey: false
        },
        {
            name: "NewsAPI",
            url: "https://newsapi.org/v2/everything?q=cybersecurity&language=en&sortBy=publishedAt&apiKey=YOUR_NEWSAPI_KEY",
            type: "api",
            apiKey: true
        }
    ];
    
    let allNews = [];
    
    for (const source of newsSources) {
        try {
            let newsItems = [];
            
            if (source.type === 'scrape') {
                newsItems = await scrapeNews(source);
            } else if (source.type === 'api') {
                newsItems = await fetchNewsAPI(source);
            }
            
            if (newsItems.length > 0) {
                // Add source name to each item
                newsItems = newsItems.map(item => ({ ...item, source: source.name }));
                allNews = [...allNews, ...newsItems];
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`Failed to fetch from ${source.name}:`, error.message);
        }
    }
    
    // If we got news, cache it
    if (allNews.length > 0) {
        cache.news = allNews.slice(0, 20); // Keep top 20
        cache.newsTimestamp = now;
        saveData(CACHE_FILE, cache);
    }
    
    return allNews;
}

async function scrapeNews(source) {
    try {
        const response = await axios.get(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const news = [];
        
        $(source.selector).slice(0, 5).each((i, element) => {
            const title = $(element).text().trim();
            let link = $(element).find(source.linkSelector).attr('href') || '';
            
            if (link && !link.startsWith('http')) {
                link = new URL(link, source.url).href;
            }
            
            if (title && link) {
                news.push({
                    title,
                    link,
                    snippet: $(element).next().text().trim().substring(0, 150) + '...'
                });
            }
        });
        
        return news;
    } catch (error) {
        console.error(`Scraping error for ${source.name}:`, error.message);
        return [];
    }
}

async function fetchNewsAPI(source) {
    try {
        const response = await axios.get(source.url, { timeout: 10000 });
        
        if (source.name === 'Cybersecurity News API') {
            return response.data.news?.map(item => ({
                title: item.title,
                link: item.url,
                snippet: item.description?.substring(0, 150) + '...'
            })) || [];
        }
        
        if (source.name === 'NewsAPI') {
            return response.data.articles?.map(article => ({
                title: article.title,
                link: article.url,
                snippet: article.description?.substring(0, 150) + '...',
                image: article.urlToImage
            })) || [];
        }
        
        return [];
    } catch (error) {
        console.error(`API error for ${source.name}:`, error.message);
        return [];
    }
}

// ==================== CONTENT GENERATORS ====================
function generateToolMessage(tool) {
    const stars = tool.stars ? `⭐ ${tool.stars.toLocaleString()} ` : '';
    const forks = tool.forks ? `🍴 ${tool.forks.toLocaleString()} ` : '';
    const language = tool.language ? `💻 ${tool.language}` : '';
    
    return `🔧 *${tool.name}*\n\n📝 ${tool.description}\n\n📊 ${stars}${forks}${language}\n🏷️ Category: ${tool.category}\n\n💻 *Installation:*\n\`\`\`bash\n${tool.install}\n\`\`\`\n\n📂 *Project Structure:*\n\`\`\`\ncd ${tool.name}\nls -la\n# Check README.md for usage\n\`\`\`\n\n🔗 *GitHub:* ${tool.url}\n🔄 Updated: ${new Date(tool.updated).toLocaleDateString()}\n\n⚠️ *USE RESPONSIBLY! Educational purposes only.*`;
}

function generateNewsMessage(newsItem) {
    return `🌐 *BREAKING: ${newsItem.title}*\n\n📝 ${newsItem.snippet || 'Read more for details...'}\n\n📰 Source: ${newsItem.source}\n🔗 Read full article: ${newsItem.link}\n\n#CyberSecurity #HackingNews`;
}

// ==================== CONTENT SENDER ====================
async function sendGitHubTool(sock, chatId) {
    try {
        const tools = await fetchGitHubHackingTools();
        
        if (tools.length === 0) {
            await sendFallbackTool(sock, chatId);
            return;
        }
        
        // Pick random tool
        const tool = tools[Math.floor(Math.random() * tools.length)];
        const message = generateToolMessage(tool);
        
        await sock.sendMessage(chatId, { text: message });
        
        // Try to get repo image/logo
        try {
            // Common logo paths
            const logoUrls = [
                `https://raw.githubusercontent.com/${tool.full_name}/master/logo.png`,
                `https://raw.githubusercontent.com/${tool.full_name}/main/logo.png`,
                `https://raw.githubusercontent.com/${tool.full_name}/master/logo.jpg`,
                `https://raw.githubusercontent.com/${tool.full_name}/main/screenshot.png`,
                `https://raw.githubusercontent.com/${tool.full_name}/master/screenshot.png`
            ];
            
            for (const logoUrl of logoUrls) {
                try {
                    const response = await axios.head(logoUrl, { timeout: 3000 });
                    if (response.status === 200) {
                        await sock.sendMessage(chatId, {
                            image: { url: logoUrl },
                            caption: `📸 ${tool.name} - Project Screenshot`
                        });
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (error) {
            // If no image found, send generic hacking image
            await sock.sendMessage(chatId, {
                image: { url: 'https://i.imgur.com/9zQ3V2s.png' },
                caption: `🛠️ ${tool.name} - Hacking Tool`
            });
        }
        
    } catch (error) {
        console.error('Error sending GitHub tool:', error);
        await sendFallbackTool(sock, chatId);
    }
}

async function sendFallbackTool(sock, chatId) {
    const fallbackTools = [
        {
            name: "Metasploit Framework",
            install: "pkg install metasploit",
            description: "The world's most used penetration testing framework",
            usage: "msfconsole → search exploit → use exploit → set options → exploit"
        },
        {
            name: "Nmap",
            install: "pkg install nmap",
            description: "Network discovery and security auditing tool",
            usage: "nmap -sV target.com\nnmap -p 1-1000 192.168.1.1"
        },
        {
            name: "SQLMap",
            install: "pip install sqlmap",
            description: "Automatic SQL injection and database takeover tool",
            usage: "sqlmap -u 'http://site.com?id=1' --dbs"
        }
    ];
    
    const tool = fallbackTools[Math.floor(Math.random() * fallbackTools.length)];
    
    await sock.sendMessage(chatId, {
        text: `🔧 *${tool.name}*\n\n📝 ${tool.description}\n\n💻 *Install:*\n\`\`\`bash\n${tool.install}\`\`\`\n\n🚀 *Usage:*\n\`\`\`bash\n${tool.usage}\`\`\`\n\n⚠️ For authorized testing only!`
    });
}

async function sendHackingNews(sock, chatId) {
    try {
        const newsItems = await fetchLatestHackingNews();
        
        if (newsItems.length === 0) {
            await sendFallbackNews(sock, chatId);
            return;
        }
        
        // Pick random news
        const news = newsItems[Math.floor(Math.random() * newsItems.length)];
        const message = generateNewsMessage(news);
        
        await sock.sendMessage(chatId, { text: message });
        
        // Try to send related image
        try {
            if (news.image) {
                await sock.sendMessage(chatId, {
                    image: { url: news.image },
                    caption: "📰 Related Image"
                });
            }
        } catch (error) {
            // Ignore image errors
        }
        
    } catch (error) {
        console.error('Error sending news:', error);
        await sendFallbackNews(sock, chatId);
    }
}

async function sendFallbackNews(sock, chatId) {
    const fallbackNews = [
        {
            title: "New Zero-Day Vulnerability Discovered",
            source: "Security Bulletin",
            content: "Security researchers have discovered a critical zero-day vulnerability affecting multiple systems. Update your software immediately.",
            link: "https://thehackernews.com"
        },
        {
            title: "Global Ransomware Attack Ongoing",
            source: "Cybersecurity Alert",
            content: "Major ransomware campaign targets organizations worldwide. Backup your data and enable multi-factor authentication.",
            link: "https://www.bleepingcomputer.com"
        },
        {
            title: "AI-Powered Hacking Tools Emerge",
            source: "Tech Security Report",
            content: "New AI tools are changing the cybersecurity landscape. Both defenders and attackers are adopting machine learning.",
            link: "https://www.darkreading.com"
        }
    ];
    
    const news = fallbackNews[Math.floor(Math.random() * fallbackNews.length)];
    
    await sock.sendMessage(chatId, {
        text: `🌐 *${news.title}*\n\n📝 ${news.content}\n\n📰 Source: ${news.source}\n🔗 ${news.link}\n\n#StaySecure #CyberAlert`
    });
}

// ==================== SCHEDULER ====================
function scheduleGroupUpdates(sock, chatId, intervalMinutes = 1) {
    const jobId = `hack_${chatId}`;
    
    // Cancel existing job
    const existingJob = schedule.scheduledJobs[jobId];
    if (existingJob) {
        existingJob.cancel();
    }
    
    let counter = 0;
    let lastContentType = null;
    
    // Schedule job
    const job = schedule.scheduleJob(jobId, `*/${intervalMinutes} * * * *`, async () => {
        counter++;
        console.log(`⏰ Update #${counter} to ${chatId}`);
        
        try {
            // Alternate content types
            let contentType;
            if (counter === 1 || lastContentType === 'tool') {
                contentType = 'news';
            } else {
                contentType = 'tool';
            }
            
            if (contentType === 'news') {
                await sock.sendMessage(chatId, {
                    text: `📰 *Fetching latest hacking news...*`
                });
                await sendHackingNews(sock, chatId);
            } else {
                await sock.sendMessage(chatId, {
                    text: `🔧 *Searching GitHub for hacking tools...*`
                });
                await sendGitHubTool(sock, chatId);
            }
            
            lastContentType = contentType;
            
            // Update cache
            const data = loadData(hack_FILE);
            if (data[chatId]) {
                data[chatId].lastSent = Date.now();
                data[chatId].counter = counter;
                data[chatId].lastType = contentType;
                saveData(hack_FILE, data);
            }
            
            // Send educational reminder every 5 updates
            if (counter % 5 === 0) {
                await sock.sendMessage(chatId, {
                    text: `🔒 *ETHICAL HACKING REMINDER #${counter}*\n\n✅ LEGAL:\n• Your own systems\n• Authorized tests\n• CTF challenges\n• Learning labs\n\n❌ ILLEGAL:\n• Unauthorized access\n• Data theft\n• System damage\n• Privacy violations\n\n💡 Knowledge is power, use it wisely!`
                });
            }
            
        } catch (error) {
            console.error('Error in scheduled update:', error);
        }
    });
    
    return job;
}

// ==================== MAIN COMMAND ====================
module.exports = async function hackCommand(sock, chatId, message, args) {
    const data = loadData(hack_FILE);
    
    if (!args[0]) {
        await sock.sendMessage(chatId, {
            text: `🤖 *DYNAMIC hack BOT*\n\n*Commands:*\n\`.hack on <minutes>\` - Start automated updates\n\`.hack off\` - Stop updates\n\`.hack status\` - Check settings\n\`.hack news\` - Get fresh news now\n\`.hack tool\` - Get new tool now\n\`.hack refresh\` - Clear cache & refetch\n\n*Examples:*\n• \`.hack on 1\` - Updates every minute\n• \`.hack on 5\` - Updates every 5 min\n\n*Content Sources:*\n🌐 Live hacking news (multiple sources)\n🔧 Real GitHub tools (updated daily)\n📸 Tool screenshots & logos\n⚡ Working installation commands\n\n⚠️ *Educational content only*`
        });
        return;
    }
    
    const subCommand = args[0].toLowerCase();
    
    if (subCommand === 'on') {
        if (!args[1]) {
            await sock.sendMessage(chatId, { text: "❌ Usage: `.hack on <minutes>`" });
            return;
        }
        
        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 60) {
            await sock.sendMessage(chatId, { text: "❌ Minutes: 1-60" });
            return;
        }
        
        // Initialize data
        if (!data[chatId]) data[chatId] = {};
        data[chatId].enabled = true;
        data[chatId].interval = minutes;
        data[chatId].started = Date.now();
        data[chatId].counter = 0;
        saveData(hack_FILE, data);
        
        // Start scheduler
        scheduleGroupUpdates(sock, chatId, minutes);
        
        await sock.sendMessage(chatId, {
            text: `✅ *hack ACTIVATED!*\n\n⏰ Updates every ${minutes} minute${minutes > 1 ? 's' : ''}\n🌐 Sources: GitHub + News APIs\n🔄 First update in ${minutes} minute${minutes > 1 ? 's' : ''}\n\n⚠️ Content updates automatically!\n🔍 Fetching fresh data now...`
        });
        
        // Initial fetch
        setTimeout(async () => {
            await sendHackingNews(sock, chatId);
            setTimeout(async () => {
                await sendGitHubTool(sock, chatId);
            }, 5000);
        }, 3000);
        
    } else if (subCommand === 'off') {
        if (!data[chatId]?.enabled) {
            await sock.sendMessage(chatId, { text: "❌ Not active" });
            return;
        }
        
        const jobId = `hack_${chatId}`;
        const job = schedule.scheduledJobs[jobId];
        if (job) job.cancel();
        
        data[chatId].enabled = false;
        saveData(hack_FILE, data);
        
        await sock.sendMessage(chatId, {
            text: `✅ *hack STOPPED*\n\nUpdates: ${data[chatId].counter || 0} sent\nDuration: ${Math.round((Date.now() - data[chatId].started) / 60000)} minutes\n\nUse \`.hack on <min>\` to restart`
        });
        
    } else if (subCommand === 'status') {
        if (!data[chatId]) {
            await sock.sendMessage(chatId, { text: "❌ Not configured" });
            return;
        }
        
        const stats = data[chatId];
        const status = stats.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE';
        const duration = stats.started ? `${Math.round((Date.now() - stats.started) / 60000)} min` : 'N/A';
        
        let text = `📊 *hack STATUS*\n\n${status}\n`;
        if (stats.enabled) {
            text += `⏰ Interval: ${stats.interval} minutes\n`;
            text += `📨 Updates sent: ${stats.counter || 0}\n`;
            text += `⏱️ Duration: ${duration}\n`;
            text += `📝 Last type: ${stats.lastType || 'N/A'}\n`;
        }
        text += `\n💾 Cache: ${Object.keys(loadData(GITHUB_CACHE_FILE).tools || {}).length} tools\n`;
        text += `📰 News: ${loadData(CACHE_FILE).news?.length || 0} articles\n`;
        
        await sock.sendMessage(chatId, { text });
        
    } else if (subCommand === 'news') {
        await sock.sendMessage(chatId, { text: "🌐 Fetching latest hacking news..." });
        await sendHackingNews(sock, chatId);
        
    } else if (subCommand === 'tool') {
        await sock.sendMessage(chatId, { text: "🔧 Searching GitHub for tools..." });
        await sendGitHubTool(sock, chatId);
        
    } else if (subCommand === 'refresh') {
        // Clear caches
        saveData(GITHUB_CACHE_FILE, {});
        saveData(CACHE_FILE, {});
        
        await sock.sendMessage(chatId, {
            text: "🔄 *CACHE CLEARED!*\n\n✅ GitHub tools cache cleared\n✅ News cache cleared\n\nNext update will fetch fresh data from all sources!"
        });
        
    } else if (subCommand === 'stats') {
        const cache = loadData(GITHUB_CACHE_FILE);
        const newsCache = loadData(CACHE_FILE);
        
        await sock.sendMessage(chatId, {
            text: `📈 *SYSTEM STATS*\n\n🔧 GitHub Tools: ${cache.tools?.length || 0}\n📰 Cached News: ${newsCache.news?.length || 0}\n🔄 Last Fetch: ${cache.timestamp ? new Date(cache.timestamp).toLocaleString() : 'Never'}\n\nActive Groups: ${Object.values(data).filter(g => g.enabled).length}`
        });
        
    } else {
        await sock.sendMessage(chatId, { text: "❌ Unknown command" });
    }
};

// Initialize on bot start
module.exports.initialize = function(sock) {
    console.log('🚀 Initializing Dynamic hack...');
    
    const data = loadData(hack_FILE);
    let active = 0;
    
    for (const [chatId, settings] of Object.entries(data)) {
        if (settings.enabled && settings.interval) {
            scheduleGroupUpdates(sock, chatId, settings.interval);
            active++;
            console.log(`✅ Scheduled ${chatId} every ${settings.interval} minutes`);
        }
    }
    
    console.log(`🎯 ${active} active group(s) initialized`);
    
    // Pre-fetch data on startup
    setTimeout(async () => {
        console.log('📥 Pre-fetching initial data...');
        try {
            await fetchGitHubHackingTools();
            await fetchLatestHackingNews();
            console.log('✅ Initial data fetched');
        } catch (error) {
            console.log('⚠️ Pre-fetch failed:', error.message);
        }
    }, 5000);
};