const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
    chatID: {
        type: String,
    },
    users: {
        type: Array,
        default: []
    }
})

module.exports = model('chat', chatSchema);
