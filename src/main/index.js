const { app, BrowserWindow, ipcMain } = require('electron/main')
const { CronJob } = require('cron')
const { createWindow } = require('./windowManager') // change src to ./ when moving to index.js
const path = require('path')
const fs = require('fs')
const bot = require('../discord/bot')

const EventEmitter = require('events');
class MainEmitter extends EventEmitter{};
const mainEmitter = new MainEmitter();
module.exports.mainEmitter = mainEmitter;

// Importing modules that require mainEmitter after creating and exporting it
const role = require('../discord/roles');
const queue = require('../discord/queue')
const registerQueueHandlers  = require('../ipcHandlers/queueHandlers');
const registerRoleHandlers  = require('../ipcHandlers/roleHandlers');
const registerTestHandlers  = require('../ipcHandlers/testHandlers');

// Loading config.json located in resources
// const configPath = path.join(__dirname, '../../extraResources/config.json');
const configPath = path.join(process.resourcesPath, 'config.json');
let idConfig = JSON.parse(fs.readFileSync(configPath))

let controllerWindow;
let selectedRole;
let roleMap;
 
app.whenReady().then(() => {

  controllerWindow = createWindow()
  controllerWindow.loadFile(path.join(__dirname, "../renderer/controller.html"))
  controllerWindow.show()

  module.exports.controllerWindow = controllerWindow;

  // Register IPC Handlers
  registerQueueHandlers(ipcMain, controllerWindow);
  registerRoleHandlers(ipcMain, controllerWindow);
  registerTestHandlers(ipcMain, controllerWindow);

  // Discord Bot Starts Here
  bot.startBot();
  bot.client.on('ready', () => {
    role.sendRoles();
    queue.sendQueue(controllerWindow.webContents);
  });

  // Make this modular, so if other people use it they can customize it. e.g. change idConfig.ROLE_NAME => .REM_ROLE_NAME
  let removeJob = new CronJob('00 00 04 * * *', async () => {
    await client.recreateRole(roleMap.get(idConfig.ROLE_NAME), controllerWindow.webContents); // manually input role name as is in discord
  });
  removeJob.start();

  const eventsPath = path.join(__dirname, '../discord/events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log('Loading event:', event.name);
    if (event.once) {
      bot.client.once(event.name, (...args) => event.execute(...args));
    } else {
      bot.client.on(event.name, (...args) => event.execute(...args));
    }
  }
// Discord bot ends here

  mainEmitter.on('role-updated', (roleMapNew, roleNames) => {
    // Update the global roleMap
    roleMap = roleMapNew;
    controllerWindow.webContents.send('role-name', roleNames);
  });

  mainEmitter.on('selected-role', (role) => {
    selectedRole = role;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      controllerWindow = createWindow();
      controllerWindow.loadFile(path.join(__dirname, "../renderer/controller.html"));
      controllerWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});