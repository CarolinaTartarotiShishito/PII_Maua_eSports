const mongoose = require('mongoose');

const avisosSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true 
    },
    descricao: {
        type: String, 
        required: true
    }
});

module.exports = mongoose.model('Avisos', avisosSchema);