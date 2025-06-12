const mongoose = require('mongoose');

const SobreSchema = new mongoose.Schema({
  conteudo: { type: String, required: true }
});

module.exports = mongoose.model('Sobre', SobreSchema);