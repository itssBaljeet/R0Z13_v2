const { app, autoUpdater, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const { Client, GatewayIntentBits, Guild } = require('discord.js')
const { CronJob } = require('cron')
require('dotenv').config()

let selectedRole;
let roleMap;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    x: autoUpdater,
    y: autoUpdater,
    show: false,
    webPreferences: {
        preload: path.join(__dirname, 'app/js/preload.js'),
        nodeIntegration: false
    }
  })
  return win; // Returns browser instance
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
})

// Time complexity of O(n), can delete role and recreate to handle mass removal => O(1)
async function removeRole(role) {
  let guild = client.guilds.cache.get(process.env.SERVER_ID)
  await guild.members.fetch()
  guild.members.cache.forEach(async (member) => {
    console.log(`${role} removed from ${member}`)
    await member.roles.remove(role)
  })
}

// Deletes and creates role, copying everything from old role except for ID. Need a solution to use or requires manually gettiing RoleIDs
async function recreateRole(roleId) {
  let guild = client.guilds.cache.get(process.env.SERVER_ID)
  await guild.roles.fetch()
  let role = guild.roles.cache.get(roleId)
  if (role) {
    const deleted = await role.delete()
    const recreated = await guild.roles.create(deleted)
  }
  // Update list
  await sendRoles();
}

async function startBot() {
  try {
    await client.login(process.env.DISCORD_TOKEN)
    console.log(`Logged in successfully as ${client.user.tag}!`)
  } catch(error) {
    console.log("Error logging in: ", error)
  }
}

// Assumes both arrays = size
async function createMap(array1, array2) {
  const map = new Map();
  for (let i = 0; i < array1.length; i++) {
    map.set(array1[i], array2[i])
  }
  return map;
}

async function sendRoles() {
  try {
    let guild = client.guilds.cache.get(process.env.SERVER_ID)
    await guild.roles.fetch()
    const roleIds = guild.roles.cache.map(role => role.id);
    const roleNames = guild.roles.cache.map(role => role.name);
    controllerWindow.webContents.send('role-id', roleIds)
    controllerWindow.webContents.send('role-name', roleNames)
    roleMap = await createMap(roleNames, roleIds);
  } catch(error) {
    console.log("Error sending role: ", error)
  }
}

app.whenReady().then(() => {

  controllerWindow = createWindow()
  controllerWindow.loadFile(path.join(__dirname, "app/controller.html"))
  controllerWindow.show()

  // Discord Bot Starts Here
  startBot();
  client.on('ready', () => {
    sendRoles();
  })
  let removeJob = new CronJob('00 00 04 * * *', async () => {
    await recreateRole(roleMap.get("In-Game")); // manually input role name as is in discord
  })
  removeJob.start();

  client.on('voiceStateUpdate', (oldState, newState) => {
    const txtChannel = client.channels.cache.get('1209245291128033340'); // manually input your own channel
    const newChannelId = newState.channelId;
    const oldChannelId = oldState.channelId;

    if (oldChannelId === newChannelId) {
      return;
    }

    // if (oldChannelId === "1230588458968289361") { //manually put the voice channel ID
    //   let role = newState.guild.roles.cache.get("1230574206312513537");
    //   txtChannel.send(`${role} role removed from ${newState.member}`);
    //   newState.member.roles.remove(role).catch(console.error);
    // }

   if (newChannelId === "1230588458968289361") {
        let role = oldState.guild.roles.cache.get(roleMap.get("In-Game")); // set to channel name for now; change to add user input
        txtChannel.send(`${role} role given to ${oldState.member}`);
        oldState.member.roles.add(role).catch(console.error);
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      controllerWindow = createWindow()
      controllerWindow.loadFile(path.join(__dirname, "app/controller.html"))
      controllerWindow.show()
    }
  })

  ipcMain.on('remove-role', (event, roleId) => {
    removeRole(roleMap.get(selectedRole));
  })

  ipcMain.on('recreate-role', (event, roleId) => {
    console.log("recreate")
    recreateRole(roleMap.get(selectedRole));
  })

  ipcMain.on('test', (event) => {
    console.log('test successful')
  })

  ipcMain.on('selected-role', (event, role) => {
    selectedRole = role;
    console.log(roleMap.get(selectedRole))
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})