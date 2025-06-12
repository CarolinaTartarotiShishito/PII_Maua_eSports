// models/jogo.js
const mongoose = require('mongoose');

const jogoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do jogo é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [300, 'Descrição não pode exceder 300 caracteres']
  },
  imagemUrl: {
    type: String,
    default: 'imagens/placeholder.png',
    trim: true
  },
  criadoEm: {
    type: Date,
    default: Date.now
  },
  atualizadoEm: {
    type: Date,
    default: Date.now
  }
});

// Atualiza o campo atualizadoEm antes de salvar
jogoSchema.pre('save', function (next) {
  this.atualizadoEm = Date.now();
  next();
});

// Atualiza o campo atualizadoEm antes de atualizar
jogoSchema.pre('findOneAndUpdate', function (next) {
  this.set({ atualizadoEm: Date.now() });
  next();
});

const Jogo = mongoose.model('Jogo', jogoSchema);

module.exports = Jogo;



async function renderizarCardsUsuarios() {
  await carregarJogos();
  const container = document.getElementById('jogos-container');
  if (!container) return;

  container.innerHTML = jogos.length === 0
    ? '<p class="text-center">Nenhum jogo disponível no momento.</p>'
    : jogos.map((jogo, index) => {
      const imagemUrl = jogo.imagemUrl || 'imagens/placeholder.png';
      const isEven = index % 2 === 0;

      return `
                <div class="card card-custom d-flex flex-row flex-wrap justify-content-between align-items-center my-4">
                    ${isEven ? `
                    <div class="col-12 col-md-6 order-2 order-md-1 p-3">
                        <h3 class="nome-do-jogo text-center text-md-end">${jogo.nome}</h3>
                        <p class="texo-explicativo text-center text-md-end">${jogo.descricao}</p>
                    </div>
                    <div class="col-12 col-md-6 order-1 order-md-2">
                        <img src="${imagemUrl}" class="img-fluid rounded shadow" alt="${jogo.nome}">
                    </div>
                    ` : `
                    <div class="col-12 col-md-6 order-1 order-md-1">
                        <img src="${imagemUrl}" class="img-fluid rounded shadow" alt="${jogo.nome}">
                    </div>
                    <div class="col-12 col-md-6 order-2 order-md-2 p-3">
                        <h3 class="nome-do-jogo text-center text-md-start">${jogo.nome}</h3>
                        <p class="texo-explicativo text-center text-md-start">${jogo.descricao}</p>
                    </div>
                    `}
                </div>`;
    }).join('');
}