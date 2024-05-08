const bot = require('./bot')
const { PermissionsBitField } = require('discord.js')
const { createMap } = require('../utils/arrayMapper')
const path =  require('path')
const fs = require('fs')
const { mainEmitter } = require('../main/index')

const configPath = path.join(__dirname, '../../extraResources/config.json');
// const configPath = path.join(process.resourcesPath, 'config.json');

let idConfig = JSON.parse(fs.readFileSync(configPath))

// Time complexity of O(n), can delete role and recreate to handle mass removal => O(1)
async function removeRole(role) {
  let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID)
  await guild.members.fetch()
  guild.members.cache.forEach(async (member) => {
    console.log(`${role} removed from ${member}`)
    await member.roles.remove(role)
  })
}

// Deletes and creates role, copying everything from old role except for ID. Need a solution for priority
async function recreateRole(roleId) {
  const guild = bot.client.guilds.cache.get(idConfig.SERVER_ID);
  await guild.roles.fetch();
  const role = guild.roles.cache.get(roleId);

  if (!role) {
    console.error('Role not found');
    return;
  }

  // Fetch channels where the role has specific permissions
  const channels = guild.channels.cache.filter(channel => 
    channel.permissionOverwrites.cache.has(roleId)
  );

  // Save the permissions from these channels
  const savedPermissions = channels.map(channel => ({
    channelId: channel.id,
    permissions: channel.permissionOverwrites.cache.get(roleId)
  }));

  // Delete the old role
  const roleData = {
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    position: role.position,
    permissions: role.permissions.bitfield,
    mentionable: role.mentionable
  };
  
  const deleted = await role.delete();
  console.log(`Deleted role: ${deleted.name}`);

  // Create the new role with the saved role data
  const recreated = await guild.roles.create({ 
    name: roleData.name,
    color: roleData.color,
    hoist: roleData.hoist,
    permissions: roleData.permissions,
    mentionable: roleData.mentionable
  });

  console.log(`Recreated role: ${recreated.name}`);

  // Reapply the saved permissions to the channels
  for (const perm of savedPermissions) {
    const channel = guild.channels.cache.get(perm.channelId);
    let permissionsObject = {};

    // Dynamically add permissions to the object if they were previously set
    const flags = PermissionsBitField.Flags;
    for (const [flag, permissionName] of Object.entries(flags)) {
        if (perm.permissions.allow.has(permissionName)) {
            permissionsObject[flag] = true;
        } else if (perm.permissions.deny.has(permissionName)) {
            permissionsObject[flag] = false;
        }
    }

    // Now apply only the permissions that were specifically set
    try {
        await channel.permissionOverwrites.edit(recreated, permissionsObject);
        console.log(`Permissions updated for ${channel.name}`);
    } catch (error) {
        console.error(`Failed to set permissions for ${channel.name}: ${error}`);
    }
}

  // Update list to show priority loss
  await sendRoles();
}

async function sendRoles() {
  try {
    let guild = bot.client.guilds.cache.get(idConfig.SERVER_ID)
    await guild.roles.fetch()
    const roleIds = guild.roles.cache.map(role => role.id);
    const roleNames = guild.roles.cache.map(role => role.name);
    let roleMap = await createMap(roleNames, roleIds);
    mainEmitter.emit('role-updated', roleMap, roleNames)
  } catch(error) {
    console.log("Error sending role: ", error)
  }
}


module.exports = { removeRole, recreateRole, sendRoles };