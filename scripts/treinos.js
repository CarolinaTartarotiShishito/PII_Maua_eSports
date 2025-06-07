// Exemplo de função para adicionar um treino
async function adicionarTreino(nome, descricao) {
    const resposta = await fetch('/api/treinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao })
    });
    const dados = await resposta.json();
    // Atualize a interface conforme necessário
}
// Listar treinos
async function listarTreinos() {
    const resposta = await fetch('/api/treinos');
    return await resposta.json();
}

// Editar treino
async function editarTreino(id, dados) {
    const resposta = await fetch(`/api/treinos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

// Excluir treino
async function excluirTreino(id) {
    const resposta = await fetch(`/api/treinos/${id}`, {
        method: 'DELETE'
    });
    return await resposta.json();
}