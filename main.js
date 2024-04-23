const { app, autoUpdater, BrowserWindow, ipcMain } = require('electron/main')
const { Client, Collection, Events, GatewayIntentBits, Guild } = require('discord.js')
const { CronJob } = require('cron')
const path = require('path')
const fs = require('fs')

let selectedRole;
let roleMap;

const configPath = path.join(__dirname, 'extraResources/config.json');
// const configPath = path.join(process.resourcesPath, 'config.json');
let idConfig = JSON.parse(fs.readFileSync(configPath))


const createWindow = () => {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    x: autoUpdater,
    y: autoUpdater,
    show: false,
    titleBarStyle: 'default',
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
  let guild = client.guilds.cache.get(idConfig.SERVER_ID)
  await guild.members.fetch()
  guild.members.cache.forEach(async (member) => {
    console.log(`${role} removed from ${member}`)
    await member.roles.remove(role)
  })
}

// Deletes and creates role, copying everything from old role except for ID. Need a solution for priority
async function recreateRole(roleId) {
  let guild = client.guilds.cache.get(idConfig.SERVER_ID)
  await guild.roles.fetch()
  let role = guild.roles.cache.get(roleId)
  if (role) {
    const deleted = await role.delete()
    const recreated = await guild.roles.create(deleted)
  }
  // Update list to show priority loss
  await sendRoles();
}

async function startBot() {
  try {
    await client.login(idConfig.DISCORD_TOKEN)
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
    let guild = client.guilds.cache.get(idConfig.SERVER_ID)
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
    await recreateRole(roleMap.get(idConfig.ROLE_NAME)); // manually input role name as is in discord
  })
  removeJob.start();

  client.commands = new Collection();

  const foldersPath = path.join(__dirname, 'app/commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  const eventsPath = path.join(__dirname, 'app/events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  client.on('voiceStateUpdate', (oldState, newState) => {
    const newChannelId = newState.channelId;
    const oldChannelId = oldState.channelId;

    if (oldChannelId === newChannelId) {
      return;
    }

    // if (oldChannelId === idConfig.VC_ID) { //manually put the voice channel ID
    //   let role = newState.guild.roles.cache.get(idConfig.ROLE_NAME);
    //   txtChannel.send(`${role} role removed from ${newState.member}`);
    //   newState.member.roles.remove(role).catch(console.error);
    // }

   if (newChannelId === idConfig.VC_ID) {
        let role = oldState.guild.roles.cache.get(roleMap.get(idConfig.ROLE_NAME)); // set to channel name for now; change to add user input
        oldState.member.roles.add(role).catch(console.error);
    }
  })
// Discord bot ends here

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      controllerWindow = createWindow()
      controllerWindow.loadFile(path.join(__dirname, "app/controller.html"))
      controllerWindow.show()
    }
  })

  ipcMain.on('remove-role', (event) => {
    removeRole(roleMap.get(selectedRole));
  })

  ipcMain.on('recreate-role', (event) => {
    console.log("recreate")
    recreateRole(roleMap.get(selectedRole));
  })

  ipcMain.on('test', (event, thing) => {
    console.log(`Test Recieved: ${thing}`)
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