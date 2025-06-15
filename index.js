require('dotenv/config');
const {Client, GatewayIntentBits} = require('discord.js');
const {CommandKit} = require('commandkit');
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
})

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    bulkRegister: true,
});

(async () => {
    //Connect to MongoDB
    try {
      await mongoose.connect(process.env.MONGO_DB);
      console.log(`Connected to the Database!`);
    } catch (err) {
      console.error(err);
    }

    client.login(process.env.TOKEN);
})();