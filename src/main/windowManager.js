const { BrowserWindow, autoUpdater } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 725,
    x: autoUpdater,
    y: autoUpdater,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    webPreferences: {
        preload: path.join(__dirname, '../renderer/js/preload.js'),
        nodeIntegration: false
    }
  })
  return win; // Returns browser instance
}

module.exports = { createWindow };
