// Exemplo de função para adicionar um jogo
async function adicionarJogo(nome, descricao) {
    const resposta = await fetch('/api/jogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao })
    });
    const dados = await resposta.json();
    // Atualize a interface conforme necessário
}
// Listar jogos
async function listarJogos() {
    const resposta = await fetch('/api/jogos');
    return await resposta.json();
}

// Editar jogo
async function editarJogo(id, dados) {
    const resposta = await fetch(`/api/jogos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

// Excluir jogo
async function excluirJogo(id) {
    const resposta = await fetch(`/api/jogos/${id}`, {
        method: 'DELETE'
    });
    return await resposta.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlBase = 'http://localhost:3000';
  
  async function carregarJogos() {
    try {
      const response = await axios.get(`${urlBase}/jogos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      alert('Erro ao carregar jogos!');
      return [];
    }
  }

  function renderizarCards(jogos) {
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

  // Carrega e renderiza
  const jogos = await carregarJogos();
  renderizarCards(jogos);
});