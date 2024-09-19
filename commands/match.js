const { SlashCommandBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('match')
		.setDescription('Match commands.')
		.addSubcommand(subCommand => subCommand
			.setName('add')
			.setDescription('Add stats for a new match (contents of .csv file).')
			.addStringOption(option => option
				.setName('game-mode')
				.setDescription('Game-mode of the match.')
				.setAutocomplete(true)
				.setRequired(true))
			.addIntegerOption(option => option
				.setName('match-time')
				.setDescription('Date and start time of the match in EST (not EDT), e.g. 197005012200 for 1970, May 1 - 10:00 pm.')
				.setRequired(true))),
	async execute(interaction) { return },
};