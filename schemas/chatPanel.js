const { Schema, model } = require('mongoose');

const chatPSchema = new Schema({
    messageID: {
        type: String
    },
    channelID: {
        type: String
    },
    threadImmune: {
        type: Array,
        default: []
    }
})

module.exports = model('chatP', chatPSchema);