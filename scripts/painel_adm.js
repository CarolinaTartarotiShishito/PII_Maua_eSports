document.addEventListener('DOMContentLoaded', function () {
    const conteudo = document.querySelector('.conteudo');

    function carregarAba(nomeAba) {
        fetch(`components/aba_${nomeAba}.html`)
            .then(res => res.text())
            .then(html => {
                conteudo.innerHTML = html;
                inicializarScriptEspecifico(nomeAba);
            })
            .catch(err => {
                conteudo.innerHTML = `<p class="text-danger">Erro ao carregar a aba "${nomeAba}".</p>`;
                console.error(err);
            });
    }

    function inicializarScriptEspecifico(nomeAba) {
        if (nomeAba == "membros") {
            prepararAbaMembros("#filtro-times-select"); // no arquivo frontend.js na pasta js
            exibeTimes('#timesUsuarioSelect')
        }
        if (nomeAba == "inicio") inicializarInicio();

        if (nomeAba == "jogos") {
            // Aguarda 50ms para garantir que o HTML foi renderizado
            setTimeout(() => {
                inicializarGerenciamentoJogos();

            }, 50);
        }

        if (nomeAba === "treinos") {
            prepararAbaTreinos('#filtro-times-select') //Essa funcao seria uma funcao para puxar os treinos existentes da equipe
        }
    }

    // Carrega o conteúdo inicial
    carregarAba('inicio');

    // Troca de abas ao clicar no menu
    document.querySelectorAll('.botao-menu').forEach(botao => {
        botao.addEventListener('click', () => {
            const textoAba = botao.textContent.trim().toLowerCase();
            const nomeAba = textoAba.replace('í', 'i');
            carregarAba(nomeAba);

            document.querySelectorAll('.botao-menu').forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
        });
    });

    // === CÓDIGO ORIGINAL DA ABA INÍCIO ADAPTADO ===
    async function inicializarInicio() {
        const btnEditarQuemSomos = document.getElementById('btn-editar-quem-somos');
        const textoQuemSomos = document.getElementById('quem-somos-texto');
        const modalQuemSomos = new bootstrap.Modal(document.getElementById('modalEditarQuemSomos'));
        const textareaQuemSomos = document.getElementById('textoQuemSomos');
        const btnSalvarQuemSomos = document.getElementById('salvarQuemSomos');

        if (btnEditarQuemSomos) {
            btnEditarQuemSomos.addEventListener('click', function () {
                textareaQuemSomos.value = textoQuemSomos.innerText;
                modalQuemSomos.show();
            });

            btnSalvarQuemSomos.addEventListener('click', async function () {
                // textoQuemSomos.innerText = textareaQuemSomos.value;
                await novoSobre(); //chama função do frontend.js
                modalQuemSomos.hide();
                // mostrarNotificacao('Texto atualizado com sucesso!');
            });
        }
        await exibeSobre('#quem-somos-texto');

        const botoesEditarRede = document.querySelectorAll('.btn-editar[data-rede]');
        const modalRede = new bootstrap.Modal(document.getElementById('modalEditarRede'));
        const inputNomeUsuario = document.getElementById('nomeUsuarioRede');
        const inputLinkRede = document.getElementById('linkRede');
        const btnSalvarRede = document.getElementById('salvarRede');
        let redeAtual = null;
        let cardAtual = null;

        botoesEditarRede.forEach(botao => {
            botao.addEventListener('click', function () {
                redeAtual = this.dataset.rede;
                cardAtual = this.closest('.rede-card');
                const textoAtual = cardAtual.querySelector('span').innerText;

                inputNomeUsuario.value = textoAtual;
                inputLinkRede.value = '';

                document.getElementById('modalEditarRedeLabel').innerText = `Editar ${redeAtual.charAt(0).toUpperCase() + redeAtual.slice(1)}`;
                modalRede.show();
            });
        });

        btnSalvarRede.addEventListener('click', function () {
            if (!redeAtual || !cardAtual) return;

            cardAtual.querySelector('span').innerText = inputNomeUsuario.value;
            modalRede.hide();
            mostrarNotificacao('Rede social atualizada com sucesso!');
        });
    }

    // === FUNÇÃO DE NOTIFICAÇÃO ===
    function mostrarNotificacao(mensagem) {
        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao-sucesso';
        notificacao.innerHTML = `
      <i class="bi bi-check-circle-fill"></i>
      <span>${mensagem}</span>
    `;
        document.body.appendChild(notificacao);

        setTimeout(() => {
            notificacao.classList.add('mostrar');
        }, 10);

        setTimeout(() => {
            notificacao.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(notificacao);
            }, 300);
        }, 3000);
    }

    // === MENU RETRÁTIL ===
    const menuLateral = document.getElementById('menu-lateral');
    const toggleMenu = document.getElementById('toggle-menu');

    if (localStorage.getItem('menuRetraido') == 'true') {
        menuLateral.classList.add('retraido');
        ajustarIconeToggle();
    }

    toggleMenu.addEventListener('click', function () {
        menuLateral.classList.toggle('retraido');
        localStorage.setItem('menuRetraido', menuLateral.classList.contains('retraido'));
        ajustarIconeToggle();
    });

    function ajustarIconeToggle() {
        if (window.innerWidth <= 768) {
            toggleMenu.innerHTML = menuLateral.classList.contains('retraido') ?
                '<i class="bi bi-chevron-down"></i>' :
                '<i class="bi bi-chevron-up"></i>';
        } else {
            toggleMenu.innerHTML = menuLateral.classList.contains('retraido') ?
                '<i class="bi bi-chevron-right"></i>' :
                '<i class="bi bi-chevron-left"></i>';
        }
    }

    window.addEventListener('resize', ajustarIconeToggle);

});

function inicializarGerenciamentoJogos() {
    const urlBase = 'http://localhost:3000';
    let jogos = [];

    // Função para carregar jogos do servidor
    async function carregarJogos() {
        try {
            const response = await axios.get(`${urlBase}/jogos`);
            jogos = response.data;
            return jogos;
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            alert('Erro ao carregar jogos do servidor!');
            return [];
        }
    }

    // Salvar jogo no MongoDB
    async function salvarJogo(nome, descricao, imagemUrl) {
        if (!nome || !descricao) {
            alert('Nome e descrição são obrigatórios!');
            return false;
        }

        const novoJogo = {
            nome,
            descricao,
            imagemUrl: imagemUrl || null
        };

        try {
            await axios.post(`${urlBase}/jogos`, novoJogo);
            return true;
        } catch (error) {
            console.error('Erro ao salvar jogo:', error);
            alert('Erro ao salvar jogo no servidor!');
            return false;
        }
    }

    // Excluir jogo
    async function excluirJogo(id) {
        try {
            await axios.delete(`${urlBase}/jogos/${id}`);
            return true;
        } catch (error) {
            console.error('Erro ao excluir jogo:', error);
            alert('Erro ao excluir jogo do servidor!');
            return false;
        }
    }

    // Editar jogo
    async function editarJogo(id, novoNome, novaDescricao, novaImagemUrl) {
        const dadosAtualizados = {
            nome: novoNome,
            descricao: novaDescricao
        };

        if (novaImagemUrl) {
            dadosAtualizados.imagemUrl = novaImagemUrl;
        }

        try {
            await axios.patch(`${urlBase}/jogos/${id}`, dadosAtualizados);
            return true;
        } catch (error) {
            console.error('Erro ao editar jogo:', error);
            alert('Erro ao atualizar jogo no servidor!');
            return false;
        }
    }

    // Upload de imagem (separado do salvamento do jogo)
    async function uploadImagem(arquivo) {
        if (!arquivo) return null;

        const formData = new FormData();
        formData.append('imagem', arquivo);

        try {
            const response = await axios.post(`${urlBase}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.url; // URL da imagem no servidor
        } catch (error) {
            console.error('Erro no upload de imagem:', error);
            alert('Erro ao fazer upload da imagem!');
            return null;
        }
    }

    // Renderização ADMIN (tabela)
    async function renderizarTabelaAdmin() {
        await carregarJogos();
        const tbody = document.getElementById('jogos-tbody');
        if (!tbody) return;

        tbody.innerHTML = jogos.map(jogo => `
        <tr data-id="${jogo._id}">
            <td>${jogo.nome}</td>
            <td>${jogo.descricao}</td>
            <td>
                <button class="btn btn-sm btn-outline-light mx-auto editar" data-id="${jogo._id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger mx-auto excluir" data-id="${jogo._id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>`).join('');

        configurarEventosAdmin();
    }

    // Renderização USUÁRIOS (cards)
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

    // Configurar eventos ADMIN
    function configurarEventosAdmin() {
        // Excluir jogo
        document.querySelectorAll('.excluir').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja excluir este jogo?')) {
                    if (await excluirJogo(id)) {
                        await renderizarTabelaAdmin();
                        await renderizarCardsUsuarios();
                    }
                }
            });
        });

        // Editar jogo
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const jogo = jogos.find(j => j._id === id);
                if (jogo) preencherFormularioEdicao(jogo);
            });
        });
    }

    function preencherFormularioEdicao(jogo) {
        document.getElementById('editar-nome').value = jogo.nome || '';
        document.getElementById('editar-descricao').value = jogo.descricao || '';
        document.getElementById('jogoId').value = jogo._id || '';

        const preview = document.getElementById('imagemPreview');
        if (jogo.imagemUrl) {
            preview.src = jogo.imagemUrl;
            preview.classList.remove('d-none');
        } else {
            preview.classList.add('d-none');
        }

        new bootstrap.Modal(document.getElementById('modalEditarJogo')).show();
    }

    // Evento para salvar novo jogo
    document.getElementById('salvarJogo')?.addEventListener('click', async () => {
        const nome = document.getElementById('nome-jogo').value;
        const descricao = document.getElementById('descricao-jogo').value;
        const imagemInput = document.getElementById('imagem-jogo');

        if (!nome || !descricao) {
            alert('Preencha nome e descrição!');
            return;
        }

        // Upload de imagem separado
        const imagemUrl = imagemInput.files[0]
            ? await uploadImagem(imagemInput.files[0])
            : null;

        if (await salvarJogo(nome, descricao, imagemUrl)) {
            alert('Jogo salvo!');
            document.getElementById('nome-jogo').value = '';
            document.getElementById('descricao-jogo').value = '';
            imagemInput.value = '';

            // Atualiza as views
            if (document.getElementById('jogos-tbody')) await renderizarTabelaAdmin();
            if (document.getElementById('jogos-container')) await renderizarCardsUsuarios();
        }
    });

    // Evento para salvar edição
    document.getElementById('btn-salvar-edicao')?.addEventListener('click', async () => {
        const id = document.getElementById('jogoId').value;
        const novoNome = document.getElementById('editar-nome').value;
        const novaDescricao = document.getElementById('editar-descricao').value;
        const novaImagemInput = document.getElementById('editar-imagem');

        // Upload da nova imagem se existir
        const novaImagemUrl = novaImagemInput.files[0]
            ? await uploadImagem(novaImagemInput.files[0])
            : null;

        if (await editarJogo(id, novoNome, novaDescricao, novaImagemUrl)) {
            alert('Jogo atualizado!');
            bootstrap.Modal.getInstance(document.getElementById('modalEditarJogo')).hide();

            // Atualiza as views
            if (document.getElementById('jogos-tbody')) await renderizarTabelaAdmin();
            if (document.getElementById('jogos-container')) await renderizarCardsUsuarios();
        }
    });

    // Inicialização automática
    (async () => {
        await carregarJogos();
        if (document.getElementById('jogos-tbody')) await renderizarTabelaAdmin();
        if (document.getElementById('jogos-container')) await renderizarCardsUsuarios();
    })();
}

// Exemplo de lógica para mostrar a aba correta
const botoesMenu = document.querySelectorAll('.botao-menu');
const eventosContainer = document.getElementById('eventos-container');
const jogosContainer = document.getElementById('jogos-container');
const painelConteudo = document.getElementById('painel-conteudo');

botoesMenu.forEach((btn, idx) => {
    btn.addEventListener('click', function () {
        eventosContainer.style.display = 'none';
        jogosContainer.style.display = 'none';
        painelConteudo.style.display = 'none';

        if (btn.textContent.includes('Eventos')) {
            eventosContainer.style.display = 'block';
            carregarAvisosPainel();
        } else if (btn.textContent.includes('Jogos')) {
            jogosContainer.style.display = 'block';
            // carregarJogosPainel();
        } else {
            painelConteudo.style.display = 'block';
        }
    });
});
