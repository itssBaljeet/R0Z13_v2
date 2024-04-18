const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const { Client, GatewayIntentBits, Guild } = require('discord.js')
const { CronJob } = require('cron')
require('dotenv').config()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 405,
    height: 900,
    x: 0,
    y: 0,
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
 ],
});

async function removeRole(role) {
  let guild = client.guilds.cache.get(process.env.SERVER_ID)
  await guild.members.fetch()
  guild.members.cache.forEach(async (member) => {
    console.log(`${role} removed from ${member}`)
    await member.roles.remove(role)
  });
}

async function startBot() {
  try {
    await client.login(process.env.DISCORD_TOKEN)
    console.log(`Logged in successfully as ${client.user.tag}!`)
  } catch(error) {
    console.log("Error logging in: ", error)
  }
}

app.whenReady().then(() => {
  controllerWindow = createWindow()
  controllerWindow.loadFile(path.join(__dirname, "app/controller.html"))
  controllerWindow.show()


  // Discord Bot Starts Here
  startBot();
  let removeJob = new CronJob('00 38 14 * * *', () => {
    removeRole("1230574206312513537");
  })
  removeJob.start();
  // Discord Bot Ends Here


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      controllerWindow = createWindow()
      controllerWindow.loadFile(path.join(__dirname, "app/controller.html"))
      controllerWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})