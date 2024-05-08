const { app, BrowserWindow, ipcMain } = require('electron/main')
const { CronJob } = require('cron')
const path = require('path')
const fs = require('fs')
const { createWindow } = require('./windowManager') // change src to ./ when moving to index.js
const bot = require('../discord/bot')
const queue = require('../discord/queue')
const EventEmitter = require('events');

class MainEmitter extends EventEmitter {}
const mainEmitter = new MainEmitter();
module.exports = { mainEmitter };
const role = require('../discord/roles')

let selectedRole;
let roleMap;

const configPath = path.join(__dirname, '../../extraResources/config.json');
// const configPath = path.join(process.resourcesPath, 'config.json');
let idConfig = JSON.parse(fs.readFileSync(configPath))
 
app.whenReady().then(() => {

  controllerWindow = createWindow()
  controllerWindow.loadFile(path.join(__dirname, "../renderer/controller.html"))
  controllerWindow.show()

  // Discord Bot Starts Here
  bot.startBot();
  bot.client.on('ready', () => {
    role.sendRoles();
    queue.sendQueue(controllerWindow.webContents);
  });

  let removeJob = new CronJob('00 00 04 * * *', async () => {
    await client.recreateRole(roleMap.get(idConfig.ROLE_NAME), controllerWindow.webContents); // manually input role name as is in discord
  });
  removeJob.start();

  const eventsPath = path.join(__dirname, '../discord/events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      bot.client.once(event.name, (...args) => event.execute(...args));
    } else {
      bot.client.on(event.name, (...args) => event.execute(...args));
    }
  }

  bot.client.on('voiceStateUpdate', (oldState, newState) => {
    const newChannelId = newState.channelId;
    const oldChannelId = oldState.channelId;

    if (oldChannelId === newChannelId) {
      return;
    }

    if (oldChannelId === idConfig.QUEUE_ID) {
      queue.sendQueue(controllerWindow.webContents);
    }

   if (newChannelId === idConfig.VC_ID) {
        let role = oldState.guild.roles.cache.get(roleMap.get(idConfig.ROLE_NAME));
        oldState.member.roles.add(role).catch(console.error);
    } else if (newChannelId === idConfig.QUEUE_ID) {
      console.log("calling sendQueue...")
      queue.sendQueue(controllerWindow.webContents);
    }
  });

  bot.client.on('join-queue', (user) => {
    queue.addToChannel(user.id)
    console.log((`${user.username} joined the queue!`))
  });
// Discord bot ends here

  mainEmitter.on('role-updated', (roleMapNew, roleNames) => {
    // Update the global roleMap or perform other actions
    roleMap = roleMapNew;
    controllerWindow.webContents.send('role-name', roleNames)
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      controllerWindow = createWindow()
      controllerWindow.loadFile(path.join(__dirname, "../renderer/controller.html"))
      controllerWindow.show()
    }
  });

  ipcMain.on('clear-queue', (event) => {
    queue.clearQueue();
  });

  ipcMain.on('random-draw', (event) => {
    queue.randomDraw();
  });

  ipcMain.on('remove-role', (event) => {
    role.removeRole(roleMap.get(selectedRole));
  });

  ipcMain.on('recreate-role', (event) => {
    console.log("recreate")
    role.recreateRole(roleMap.get(selectedRole));
  });

  ipcMain.on('test', (event, thing) => {
    console.log(`Test Recieved: ${thing}`)
  });

  ipcMain.on('selected-role', (event, role) => {
    selectedRole = role;
    console.log(roleMap.get(selectedRole))
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});