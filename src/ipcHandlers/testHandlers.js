function registerTestHandlers(ipcMain, controllerWindow) {
  ipcMain.on('test', (event, thing) => {
      console.log(`Test Received: ${thing}`);
  });
}

module.exports =  registerTestHandlers ;
