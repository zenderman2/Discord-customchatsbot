const chat = require('../../schemas/chat');
const chatP = require('../../schemas/chatPanel');
require('dotenv/config');

module.exports = async (client) => {

    //Auto chat delete after less members
    setInterval(async () => {
        const chats = await chat.find();

        for (const chatD of chats) {            
            let channel;
            try {
                channel = client.channels.cache.get(process.env.CHANNELID) || await client.channels.fetch(process.env.CHANNELID);
            } catch (e) {}
            if (!channel) continue;
            let thread;
            try {
                thread = await channel.threads.fetch(chatD.chatID);
            } catch (e) {console.log(e)}

            if (!thread) {
                await chat.deleteOne({chatID: chatD.chatID});
                continue;
            }
            
            const panelData = await chatP.findOne({channelID: process.env.CHANNELID});
            if (!panelData) continue;

            await new Promise(resolve => setTimeout(resolve, 500));

            if (!panelData.threadImmune.includes(thread.id) && thread.memberCount >= 2 && thread.memberCount < 3) {
                await thread.delete('Auto-deleted thread due to less members.');
                panelData.threadImmune = panelData.threadImmune.filter(r => r !== thread.id);
                await panelData.save();
                await chat.deleteOne({chatID: chatD.chatID});
            } else if (thread.memberCount < 2) {
                await thread.delete('Auto-deleted thread due to less members.');
                panelData.threadImmune = panelData.threadImmune.filter(r => r !== thread.id);
                await panelData.save();
                await chat.deleteOne({chatID: chatD.chatID});
            } else if (!panelData.threadImmune.includes(thread.id) && chatD.users.length < 2) {
                await thread.delete('Auto-deleted thread due to member leave.');
                panelData.threadImmune = panelData.threadImmune.filter(r => r !== thread.id);
                await panelData.save();
                await chat.deleteOne({chatID: chatD.chatID});
            }
        }
    }, 2000)
}