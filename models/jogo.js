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
    maxlength: [1000, 'Descrição não pode exceder 1000 caracteres']
  },
  imagemUrl: {
    type: String,
    default: 'imagens/placeholder.png',
    trim: true,
    validate: {
      validator: function(v) {
        // Validação simples de URL ou caminho de arquivo
        return /^(https?:\/\/[^\s]+)|(\.?\/?[a-z0-9_\-./]+\.(jpg|jpeg|png|gif))$/i.test(v);
      },
      message: props => `${props.value} não é uma URL de imagem válida!`
    }
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
                <div class="card card-custom d-flex flex-row justify-content-between">
                    ${isEven ? `
                        <img src="${jogo.imagemUrl}" class="game-image-e order-2 order-sm-1" alt="Card do jogo ${jogo.nome}">
                        <div class="Card-de-jogos-e text-center text-sm-start order-1 order-sm-2">
                            <h3 class="nome-do-jogo">${jogo.nome}</h3>
                            <p class="texo-explicativo">${jogo.descricao}</p>
                        </div>
                    ` : `
                        <div class="Card-de-jogos-d text-center text-sm-end justify-content-start align-items-start order-1 order-sm-1">
                            <h3 class="nome-do-jogo">${jogo.nome}</h3>
                            <p class="texo-explicativo">${jogo.descricao}</p>
                        </div>
                        <img src="${jogo.imagemUrl}" class="game-image-d order-2 order-sm-2" alt="Card do jogo ${jogo.nome}">
                    `}
                </div>`;
    }).join('');
}