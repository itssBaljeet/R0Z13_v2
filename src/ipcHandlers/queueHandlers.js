const queue = require('../discord/queue');

function registerQueueHandlers(ipcMain, controllerWindow) {
    ipcMain.on('clear-queue', (event) => {
        queue.clearQueue();
    });

    ipcMain.on('random-draw', (event) => {
        queue.randomDraw();
    });
}

module.exports =  registerQueueHandlers ;
