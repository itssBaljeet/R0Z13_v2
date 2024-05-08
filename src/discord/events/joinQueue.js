const { Events } = require('discord.js');
const queue = require('../queue');

module.exports = {
    name: 'join-queue', // This is a custom event name; adjust if you have a constant for it
    async execute(user) {
        queue.addToChannel(user.id);
        console.log(`${user.username} joined the queue!`);
    },
};
