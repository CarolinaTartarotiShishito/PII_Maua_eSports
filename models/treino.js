const mongoose = require('mongoose');

const treinosSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String
});

module.exports = mongoose.model('Treinos', treinosSchema);