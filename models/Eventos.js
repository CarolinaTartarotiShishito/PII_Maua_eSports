const mongoose = require('mongoose');

const eventosSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String
});

module.exports = mongoose.model('Eventos', eventosSchema);