const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Cargo: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Jogo: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);