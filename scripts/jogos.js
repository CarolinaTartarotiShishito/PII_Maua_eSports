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
      ? '<p class="text-center">Nenhum jogo disponível</p>'
      : jogos.map((jogo, index) => `
          <div class="card card-custom my-4">
            <div class="row g-0">
              <div class="col-md-6 ${index % 2 === 0 ? 'order-md-2' : ''}">
                <img src="${jogo.imagemUrl || 'imagens/placeholder.png'}" 
                     class="img-fluid rounded-start" alt="${jogo.nome}">
              </div>
              <div class="col-md-6 d-flex align-items-center ${index % 2 === 0 ? 'order-md-1' : ''}">
                <div class="card-body text-center p-4">
                  <h3 class="card-title">${jogo.nome}</h3>
                  <p class="card-text">${jogo.descricao}</p>
                </div>
              </div>
            </div>
          </div>
        `).join('');
  }

  // Carrega e renderiza
  const jogos = await carregarJogos();
  renderizarCards(jogos);
});