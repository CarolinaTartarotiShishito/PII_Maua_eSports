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
