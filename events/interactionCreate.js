const { Events, time, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const HideAndSeekStats = interaction.client.HideAndSeekStats;
		
		if (interaction.isChatInputCommand()) {
			let subCommandGroup = '';
			let subCommand = '';
			let scg = '';
			let sc = '';
			
			try {
				subCommandGroup = `${interaction.options.getSubcommandGroup()}`
				if (subCommandGroup == 'null')
					subCommandGroup = '';
				else
					scg = ` ${subCommandGroup}`;
			} catch (error) {
				if (error.code != 'CommandInteractionOptionNoSubcommand') {
					console.log(error);
				}
			}

			try {
				subCommand = `${interaction.options.getSubcommand()}`
				if (subCommand == 'null')
					subCommand = '';
				else
					sc = ` ${subCommand}`;
			} catch (error) {
				if (error.code != 'CommandInteractionOptionNoSubcommand') {
					console.log(error);
				}
			}

			console.log(`${Date(interaction.createdTimestamp)}: Command sent by member:${interaction.user.id}: ${interaction.commandName}${scg}${sc}`);

			if (interaction.commandName === 'match' && subCommand === 'add') {
				if (interaction.guild === null) {
					await interaction.reply('Please copy the entire content of the match csv file, and send it here as a message.');
					interaction.user.createDM()
						.then(async () => {
							interaction.channel.awaitMessages({max: 1, time: 60_000, errors: ['time'] })
								.then(async collectRaw => {
									let collectMsg = collectRaw.map(i => i)[0];
									collected = collectMsg.content;
									const headers = 'name,role,correct votes,incorrect votes,correct ejects,incorrect ejects,tasks completed,tasks total,alive at meeting before game end,first two victims round1,Number of Crewmates Ejected (imposter only),critical meeting error,kills,survivability,win type\n';

									if (collected.startsWith(headers) && collected.match(/,/g).length == 154) {
										collected = collected.split('\n');

										let dbInput = [];
										for (let i of collected) {
											dbInput.push(i.split(','));
										}
										dbInput.shift();

										for (let entry of dbInput) {
											try {
												const tag = await HideAndSeekStats.create({
													match_id: interaction.options.get('match-time').value,
													name: entry[0],
													role: entry[1],
													correct_votes: parseInt(entry[2]),
													incorrect_votes: parseInt(entry[3]),
													correct_ejects: parseInt(entry[4]),
													incorrect_ejects: parseInt(entry[5]),
													tasks_completed: parseInt(entry[6]),
													tasks_total: parseInt(entry[7]),
													alive_at_meeting_before_game_end: entry[8],
													first_two_victims_round1: entry[9],
													number_of_crewmates_ejected_imposter_only: parseInt(entry[10]),
													critical_meeting_error: entry[11],
													kills: parseInt(entry[12]),
													survivability: parseInt(entry[13]),
													win_type: entry[14],
												});
											}
											catch (error) {
												if (error.name === 'SequelizeUniqueConstraintError')
													return collectMsg.reply('That tag already exists.');
												else if (error.parent.code === 'SQLITE_BUSY')
													return collectMsg.reply('The database could not be written to.');
												else
													return collectMsg.reply('Something went wrong with adding a tag.');
												break;
											}
										}
										return collectMsg.reply('Successful.');
									}
								});
						});
				} else
					await interaction.reply('This command is only available via direct message.');
			} 
		} else if (interaction.isAutocomplete()) {
			const focusedOption = interaction.options.getFocused(true);

			if (interaction.commandName === 'match') {
				const choices = ['Regular', 'Hide and Seek'];
				const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedOption.value.toLowerCase()));
				await interaction.respond(
					filtered.map(choice => ({ name: choice, value: choice })),
				);
			}
		} else if (interaction.isButton()) {
		}
	},
};