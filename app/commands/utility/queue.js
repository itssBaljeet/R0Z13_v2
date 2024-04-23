const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Join the queue!'),
	async execute(interaction) {
		await interaction.reply('You joined the queue!');
	},
};
