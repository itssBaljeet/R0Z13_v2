const bot = require('./bot')
const path = require('path')
const fs = require('fs')

const configPath = path.join(__dirname, '../../extraResources/config.json');
// const configPath = path.join(process.resourcesPath, 'config.json');
let idConfig = JSON.parse(fs.readFileSync(configPath))

async function sendQueue(webContents) {
  try {
    console.log("trying sendQueue...");
    let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID);
    const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2);
    const channel = voiceChannels.find(ch => ch.name === idConfig.CHANNEL_NAME);
    if (!channel.members) {
        console.log("Voice channel 'queue' does not have member information available.");
        return;
    }
    const queueNames = channel.members.map(member => member.user.username);
    webContents.send('queue-name', queueNames);
  } catch (error) {
      console.error("Error sending queue:", error);
  }
}

async function addToChannel(userId) {
  try {
    let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID)
    await guild.channels.fetch()
    guild.members.cache.get(userId).voice.setChannel(idConfig.VC_ID)
  } catch(error) {
    console.error("Error sending: ", error)
  };
}

async function randomDraw() {
  try {
    let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID);
    let queueChannel = guild.channels.cache.get(idConfig.QUEUE_ID);

    if (!queueChannel || queueChannel.type !== 2) {
      console.log("Voice channel 'queue' not found or is not a voice channel.");
      return;
    }

    // Get an array of member IDs in the queue channel
    const memberIds = queueChannel.members.map(member => member.id);

    // Randomly select a member ID
    const randomMemberId = memberIds[Math.floor(Math.random() * memberIds.length)];

    // Call addToChannel with the randomly selected member's ID
    await addToChannel(randomMemberId);
    console.log("Random draw completed successfully.");
  } catch(error) {
    console.error("There was an error drawing: ", error);
  }
}

async function clearQueue() {
  try {
    let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID);
    let queueChannel = guild.channels.cache.get(idConfig.QUEUE_ID);
    
    if (!queueChannel || queueChannel.type !== 2) {
      console.log("Voice channel 'queue' not found or is not a voice channel.");
      return;
    }

    queueChannel.members.forEach(async member => {
      try {
        // Move each member to a different voice channel or disconnect them
        await member.voice.disconnect();
        console.log(`User ${member.user.username} removed from the queue.`);
      } catch (error) {
        console.error(`Error removing user ${member.user.username} from the queue:`, error);
      }
    });
  } catch(error) {
    console.error("Error clearing queue: ", error);
  }
}

module.exports = { sendQueue , addToChannel, randomDraw, clearQueue }