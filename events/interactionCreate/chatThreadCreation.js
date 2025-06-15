const chat = require('../../schemas/chat');
const chatP = require('../../schemas/chatPanel');
require('dotenv/config')
const {ThreadAutoArchiveDuration, ChannelType, ButtonBuilder, ActionRowBuilder, Component} = require('discord.js');

module.exports = async (interaction, client) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'chat') return;

    const userData = await chat.findOne({ users: { $in: [interaction.user.id] } });
    if (userData) {
        const allowedRoles = process.env.VIPROLES.split(',');
        if (allowedRoles.some(r => interaction.member.roles.cache.has(r))) {
            const totalChats = await chat.find({ users: { $in: [interaction.user.id] }, $expr: { $gt: [{ $size: "$users" }, 0] } });
            if (totalChats.length > 4) {
                return await interaction.reply({content: 'You already have five chats running.', ephemeral: true});
            }
        } else { 
            return await interaction.reply({content: 'You already have one chat running.\nBe a server booster to chat with up to 5 people.', ephemeral: true});
        }
    } 

    const openChats = await chat.find({
        $expr: { $lt: [{ $size: "$users" }, 2] }, users: { $nin: [interaction.user.id] }
    });

    const channel = client.channels.cache.get(process.env.CHANNELID) || undefined;
    if (!channel) return await interaction.reply({content: 'Panel not found. Please retry.', ephemeral: true});

    const panelData = await chatP.findOne({channelID: process.env.CHANNELID});
    if (!panelData) return await interaction.reply({content: 'Panel not found.', ephemeral: true});

    const button = new ButtonBuilder().setCustomId('chat-leave').setEmoji('⚔️').setLabel('Leave').setStyle(4);
    const row = new ActionRowBuilder().addComponents(button); 

    if (openChats.length > 0) {
        const openChat = openChats[0];
        openChat.users.push(interaction.user.id);
        await openChat.save();
        let thread;
        try {
            thread = await channel.threads.fetch(openChat.chatID);
        } catch (error) {}
        if (!thread) return await chat.deleteOne({chatID: openChat.chatID});

        try {
            const fetchedMessages = await thread.messages.fetch({ limit: 100 });
    
            for (const message of fetchedMessages.values()) {
                try {
                    await message.delete();
                } catch (err) {};
            }
        } catch (e) {};

       await thread.send({content: `<@${openChat.users[0]}>, <@${openChat.users[1]}>\n# 👋 Say Hello!`, components: [row]});

       panelData.threadImmune = panelData.threadImmune.filter(r => r !== thread.id);
       await panelData.save();
       return await interaction.reply({content: 'Joined a chat.', ephemeral: true});
    }

    const thread = await channel.threads.create({
        name: 'Your Chat',
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
        type: ChannelType.PrivateThread,
        reason: 'Started a random chat.',
    });
    panelData.threadImmune.push(thread.id);
    await panelData.save();

    await new chat({chatID: thread.id, users: [interaction.user.id]}).save();
    await thread.send(`<@${interaction.user.id}>\n\n# ⌛ Please wait...`).catch(() => {});

    return await interaction.reply({content: 'Created a chat.', ephemeral: true});

}
