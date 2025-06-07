const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Email: {
        type: String,
        required: true,
        unique: true
    },
    NomeCompleto: {
        type: String,
        required: true
    },
    Nickname: {
        type: String,
        required: true
    },
    IdDiscord: {
        type: String,
        required: true,
        unique: true
    },
    Cargo: {
        type: String,
        required: true
    },
    Time: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('User', userSchema);