const mongoose = require('mongoose');

const jogoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String
});

module.exports = mongoose.model('Jogo', jogoSchema);