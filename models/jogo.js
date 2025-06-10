const mongoose = require('mongoose');

const jogoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String }, 
    imagem: {
    data: Buffer,    // Dados binários da imagem
    contentType: String  // Tipo da imagem (ex: 'image/png', 'image/jpeg')
  }
});

module.exports = mongoose.model('Jogo', jogoSchema);