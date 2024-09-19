const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const Sequelize = require('sequelize');
const { token } = require('./config.json');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.DirectMessages,
	]
});

// Initialise slash commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Database initialise
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
	define: {
		freezeTableName: true
	}
});

// Database - Hide & Seek stats
const HideAndSeekStats = sequelize.define('Hide and Seek', {
	match_id: Sequelize.INTEGER,
	name: Sequelize.STRING,
	role: Sequelize.STRING,
	correct_votes: Sequelize.INTEGER,
	incorrect_votes: Sequelize.INTEGER,
	correct_ejects: Sequelize.INTEGER,
	incorrect_ejects: Sequelize.INTEGER,
	tasks_completed: Sequelize.INTEGER,
	tasks_total: Sequelize.INTEGER,
	alive_at_meeting_before_game_end: Sequelize.STRING,
	first_two_victims_round1: Sequelize.STRING,
	number_of_crewmates_ejected_imposter_only: Sequelize.INTEGER,
	critical_meeting_error: Sequelize.STRING,
	kills: Sequelize.INTEGER,
	survivability: Sequelize.INTEGER,
	win_type: Sequelize.STRING,
});
client.HideAndSeekStats = HideAndSeekStats;

client.once(Events.ClientReady, readyClient => {
    HideAndSeekStats.sync();
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);