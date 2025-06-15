const chat = require('../../schemas/chat');
const chatP = require('../../schemas/chatPanel');
require('dotenv/config');

module.exports = async (interaction, client) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'chat-leave') return;

    const chatData = await chat.findOne({ chatID: interaction.channel.id });
    if (!chatData) return await interaction.reply({content: 'An error occurred.', ephemeral: true});

    const panelData = await chatP.findOne({ channelID: process.env.CHANNELID });
    if (!panelData) return await interaction.reply({content: 'An error occurred.\n`Unable to find the panel.`', ephemeral: true});

    panelData.threadImmune = panelData.threadImmune.filter(r => r !== interaction.channel.id);
    await panelData.save();

    chatData.users = chatData.users.filter(r=> r!==interaction.user.id);
    await chatData.save();

    await interaction.channel.send(`<@${interaction.user.id}> left the chat.`).catch(() => {});
}