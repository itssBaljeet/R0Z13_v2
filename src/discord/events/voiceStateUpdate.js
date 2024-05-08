const { Events } = require('discord.js');
const queue = require('../queue');
const path = require('path')
const fs = require('fs')
const  mainEmitter  = require('../../main/index').mainEmitter

// Loading config.json located in resources
// const configPath = path.join(__dirname, '../../../extraResources/config.json');
const configPath = path.join(process.resourcesPath, 'config.json');
let idConfig = JSON.parse(fs.readFileSync(configPath))

let roleMap;

mainEmitter.on('role-updated', (updatedRoleMap, roleNames) => {
  // Update the global roleMap
  roleMap = updatedRoleMap;
});

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const newChannelId = newState.channelId;
        const oldChannelId = oldState.channelId;

        if (oldChannelId === newChannelId) {
            return;
        }

        // Access the controllerWindow from a shared or global state
        const controllerWindow = require('../../main/index').controllerWindow; // Adjust as per your structure

        if (!controllerWindow || !controllerWindow.webContents) {
          console.error("The controller window or its web contents are not available.");
          return;
        }


        if (oldChannelId === idConfig.QUEUE_ID) {
          queue.sendQueue(controllerWindow.webContents);
        }
  
        if (newChannelId === idConfig.VC_ID) {
          const role = oldState.guild.roles.cache.get(roleMap.get(idConfig.ROLE_NAME));
          if (role) {
            oldState.member.roles.add(role).catch(console.error);
          } else {
            console.log(`Role ${idConfig.ROLE_NAME} not found.`);
          }
        } else if (newChannelId === idConfig.QUEUE_ID) {
          console.log("Calling sendQueue...");
          queue.sendQueue(controllerWindow.webContents);
        }
    },
};
