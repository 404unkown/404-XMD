// commands/tiktokstalk.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function tiktokstalkCommand(sock, chatId, message, args) {
  try {
    if (!args || args.length === 0) {
      await sock.sendMessage(chatId, {
        text: `❌ *Please provide a TikTok username!*\n\n*Usage:* ${global.PREFIX || '.'}tiktokstalk username\n*Example:* ${global.PREFIX || '.'}tiktokstalk charli_damelio`,
        ...global.channelInfo
      }, { quoted: message });
      return;
    }

    const username = args[0];
    
    // Send processing reaction
    await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

    // Try multiple APIs in case one fails
    const apis = [
      // API 1: RapidAPI TikTok
      async () => {
        const options = {
          method: 'GET',
          url: 'https://tiktok-api6.p.rapidapi.com/user/info',
          params: { username: username },
          headers: {
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // You need to get this
            'X-RapidAPI-Host': 'tiktok-api6.p.rapidapi.com'
          }
        };
        return await axios.request(options);
      },
      
      // API 2: Alternative TikTok API
      async () => {
        return await axios.get(`https://tokapi-mobile-version.p.rapidapi.com/v1/user/${username}`, {
          headers: {
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
            'X-RapidAPI-Host': 'tokapi-mobile-version.p.rapidapi.com'
          }
        });
      },
      
      // API 3: Simple web scraping approach
      async () => {
        // This is a fallback using HTML scraping (less reliable)
        const response = await axios.get(`https://www.tiktok.com/@${username}`);
        const html = response.data;
        
        // Extract data from HTML (simplified - actual parsing would be more complex)
        const extractData = (regex, html) => {
          const match = html.match(regex);
          return match ? match[1] : 'N/A';
        };
        
        return {
          data: {
            user: {
              username: username,
              nickname: extractData(/<h1[^>]*>([^<]+)<\/h1>/, html) || username,
              bio: extractData(/<h2[^>]*>([^<]+)<\/h2>/, html) || 'No bio',
              avatar: extractData(/<img[^>]*src="([^"]+)"[^>]*avatar/, html) || '',
              followers: extractData(/followersCount[^>]*>([^<]+)</, html) || 'N/A',
              following: extractData(/followingCount[^>]*>([^<]+)</, html) || 'N/A',
              likes: extractData(/heartCount[^>]*>([^<]+)</, html) || 'N/A',
              videos: extractData(/videoCount[^>]*>([^<]+)</, html) || 'N/A'
            }
          }
        };
      }
    ];

    let userData = null;
    let profilePic = null;
    
    for (const apiCall of apis) {
      try {
        const response = await apiCall();
        if (response.data) {
          userData = response.data;
          
          // Try to get profile picture
          if (userData.user?.avatar || userData.user?.profile_pic) {
            try {
              const picResponse = await axios.get(userData.user.avatar || userData.user.profile_pic, {
                responseType: 'arraybuffer'
              });
              profilePic = Buffer.from(picResponse.data);
            } catch (picError) {
              console.log('Failed to download profile picture:', picError.message);
            }
          }
          break;
        }
      } catch (apiError) {
        console.log(`API failed:`, apiError.message);
        continue;
      }
    }

    if (!userData) {
      throw new Error('Failed to fetch TikTok profile information');
    }

    // Format the response
    const formatNumber = (num) => {
      if (!num || num === 'N/A') return 'N/A';
      if (typeof num === 'string') return num;
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    const user = userData.user || userData;
    const caption = `📱 *TikTok Profile Info*\n
👤 *Username:* @${user.username || username}
✨ *Name:* ${user.nickname || user.full_name || 'N/A'}
📝 *Bio:* ${user.bio || user.signature || 'No bio available'}

📊 *Statistics:*
✅ *Followers:* ${formatNumber(user.followers || user.follower_count)}
❇️ *Following:* ${formatNumber(user.following || user.following_count)}
❤️ *Total Likes:* ${formatNumber(user.likes || user.heart_count || user.digg_count)}
🎁 *Videos:* ${formatNumber(user.videos || user.video_count)}

🔗 *Profile URL:* https://tiktok.com/@${user.username || username}`;

    // Send response
    if (profilePic) {
      await sock.sendMessage(chatId, {
        image: profilePic,
        caption: caption,
        ...global.channelInfo
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, {
        text: caption,
        ...global.channelInfo
      }, { quoted: message });
    }

    // Success reaction
    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

  } catch (error) {
    console.error('TikTok stalk error:', error);
    
    let errorMessage = '❌ Failed to fetch TikTok profile!';
    
    if (error.message.includes('404')) {
      errorMessage = `❌ User "${args[0]}" not found!`;
    } else if (error.message.includes('rate limit')) {
      errorMessage = '❌ Rate limit exceeded. Try again later.';
    } else if (error.message.includes('API')) {
      errorMessage = '❌ TikTok API is currently unavailable.';
    }
    
    await sock.sendMessage(chatId, {
      text: `${errorMessage}\n\nError: ${error.message}`,
      ...global.channelInfo
    }, { quoted: message });
    
    await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
  }
}

module.exports = tiktokstalkCommand;