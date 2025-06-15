require('dotenv/config');
const chatP = require('../../schemas/chatPanel');
const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');

module.exports = async (client) => {
    setInterval(async () => {
        try {
            let channel;
            try {
                channel = client.channels.cache.get(process.env.CHANNELID) || await client.channels.fetch(process.env.CHANNELID);
            } catch (e) {}
            
            if (!channel) return;
            const panelData = await chatP.findOne({channelID: channel.id});
            let message;
            try {
                message = await channel.messages.fetch(panelData.messageID);
            } catch (e) {}
            if (message) return;
            
            const embed = new EmbedBuilder()
                .setTitle('Random Chat')
                .setDescription('This starts a random chat.')
                .setColor('Gold')
            
            const button = new ButtonBuilder().setCustomId('chat').setEmoji('💬').setLabel('Chat with a random person').setStyle(1);
            const row = new ActionRowBuilder().addComponents(button);    

            const nMsg = await channel.send({embeds: [embed], components: [row]}).catch(() => {});
            if (panelData) await chatP.deleteOne({channelID: panelData.channelID});
            await new chatP({messageID: nMsg.id, channelID: process.env.CHANNELID}).save();
        } catch (e) {
            console.log(e)
        }
    }, 5000)
}