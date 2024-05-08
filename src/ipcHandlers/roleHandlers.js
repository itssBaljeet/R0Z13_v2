const role = require('../discord/roles');
const { mainEmitter } = require('../main/index')

function registerRoleHandlers(ipcMain, controllerWindow) {
    let selectedRole;
    let roleMap;
    mainEmitter.on('role-updated', (roleMapNew, roleNames) => {
      // Update the global roleMap
      roleMap = roleMapNew;
    });
    ipcMain.on('remove-role', (event) => {
        role.removeRole(roleMap.get(selectedRole));
    });

    ipcMain.on('recreate-role', (event) => {
        console.log("recreate");
        role.recreateRole(roleMap.get(selectedRole));
    });

    ipcMain.on('selected-role', (event, sRole) => {
        console.log(`Selected Role: ${sRole}`);
        selectedRole = sRole;
        mainEmitter.emit('selected-role', selectedRole);
        // Store or do something with selected role if needed
    });
}

module.exports =  registerRoleHandlers ;
