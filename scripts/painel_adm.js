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
        }
        if (nomeAba == "inicio") inicializarInicio();

        if (nomeAba == "jogos") {
            // Aguarda 50ms para garantir que o HTML foi renderizado
            setTimeout(() => {
                inicializarGerenciamentoJogos();

            }, 50);
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
    function inicializarInicio() {
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

            btnSalvarQuemSomos.addEventListener('click', function () {
                textoQuemSomos.innerText = textareaQuemSomos.value;
                modalQuemSomos.hide();
                mostrarNotificacao('Texto atualizado com sucesso!');
            });
        }

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
    // Variáveis privadas
    let jogos = JSON.parse(localStorage.getItem('jogos')) || [];

    // Funções internas (compartilhadas)
    function salvarJogo(nome, descricao, imagem) {
        if (!nome || !descricao) {
            alert('Nome e descrição são obrigatórios!');
            return false;
        }

        const novoJogo = {
            id: Date.now(),
            nome: nome,
            descricao: descricao,
            imagem: imagem || null
        };

        jogos.push(novoJogo);
        salvarNoLocalStorage();
        return true;
    }

    function excluirJogo(id) {
        const index = jogos.findIndex(jogo => jogo.id === id);
        if (index !== -1) {
            jogos.splice(index, 1);
            salvarNoLocalStorage();
            return true;
        }
        return false;
    }

    function editarJogo(id, novoNome, novaDescricao, novaImagem) {
        const jogo = jogos.find(jogo => jogo.id === id);
        if (jogo) {
            if (novoNome !== undefined) jogo.nome = novoNome;
            if (novaDescricao !== undefined) jogo.descricao = novaDescricao;
            if (novaImagem !== undefined) jogo.imagem = novaImagem;
            salvarNoLocalStorage();
            return true;
        }
        return false;
    }

    function carregarImagemComoBase64(arquivo, callback) {
        if (!arquivo) {
            callback(null);
            return;
        }
        const leitor = new FileReader();
        leitor.onload = (e) => callback(e.target.result);
        leitor.readAsDataURL(arquivo);
    }

    function salvarNoLocalStorage() {
        localStorage.setItem('jogos', JSON.stringify(jogos));
    }

    // Renderização para ADMIN (tabela)
    function renderizarTabelaAdmin() {
        const tbody = document.getElementById('jogos-tbody');
        if (!tbody) return;

        tbody.innerHTML = jogos.map(jogo => `
        <tr data-id="${jogo.id}">
            <td>${jogo.nome}</td>
            <td>${jogo.descricao}</td>
            <td>
                <!-- Botão Editar com ID único (prefixo + id do jogo) -->
                <button 
                    id="btn-editar-${jogo.id}" 
                    class="btn btn-sm btn-outline-light mx-auto editar" 
                    data-id="${jogo.id}"
                >
                    <i class="bi bi-pencil"></i>
                </button>

                <!-- Botão Excluir com ID único -->
                <button 
                    id="btn-excluir-${jogo.id}" 
                    class="btn btn-sm btn-outline-danger mx-auto excluir" 
                    data-id="${jogo.id}"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
        `).join('');

        configurarEventosAdmin(); // Reconfigura os eventos
    }

    // Renderização para USUÁRIOS (cards)
    function renderizarCardsUsuarios() {
        const container = document.getElementById('jogos-container');

        if (!container) {
            console.error('Container #jogos-container não encontrado!');
            return;
        }

        // Garanta que jogos é um array
        jogos = Array.isArray(jogos) ? jogos : [];

        if (jogos.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum jogo disponível no momento.</p>';
            return;
        }

        container.innerHTML = jogos.map((jogo, index) => {
            const isEven = index % 2 === 0;
            // Use imagem padrão se não houver imagem
            const imagemUrl = jogo.imagem || 'imagens/placeholder.png';

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

    // Chame a função quando o DOM estiver pronto

    renderizarCardsUsuarios();


    // Configura eventos do admin
    function configurarEventosAdmin() {

        // Excluir jogo (usa classe .excluir)
        document.querySelectorAll('.excluir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id); // currentTarget é mais seguro que target
                if (confirm('Tem certeza que deseja excluir este jogo?')) {
                    if (excluirJogo(id)) {
                        renderizarTabelaAdmin();
                        renderizarCardsUsuarios();
                    }
                }
            });
        });

        // Editar jogo (usa classe .editar)
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const jogo = jogos.find(j => j.id === id);
                if (jogo) preencherFormularioEdicao(jogo);
            });
        });
    }

    function preencherFormularioEdicao(jogo) {
        // Preenche os campos (agora com os IDs corretos) aleluia
        document.getElementById('editar-nome').value = jogo.nome || '';
        document.getElementById('editar-descricao').value = jogo.descricao || '';
        document.getElementById('jogoId').value = jogo.id || '';

        // Atualiza preview da imagem
        if (jogo.imagemUrl) {
            const preview = document.getElementById('imagemPreview');
            preview.src = jogo.imagemUrl;
            preview.classList.remove('d-none');
        }

        // Mostra o modal
        const modal = new bootstrap.Modal(document.getElementById('modalEditarJogo'));
        modal.show();
    }

    // Evento para salvar novo jogo (com validação)
    document.getElementById('salvarJogo')?.addEventListener('click', () => {
        const nome = document.getElementById('nome-jogo').value; // ID deve existir
        const descricao = document.getElementById('descricao-jogo').value;
        const imagemInput = document.getElementById('imagem-jogo');

        if (!nome || !descricao) {
            alert('Preencha nome e descrição!');
            return;
        }

        carregarImagemComoBase64(imagemInput.files[0], (imagemBase64) => {
            if (salvarJogo(nome, descricao, imagemBase64)) {
                alert('Jogo salvo!');
                document.getElementById('nome-jogo').value = '';
                document.getElementById('descricao-jogo').value = '';
                imagemInput.value = '';
                renderizarTabelaAdmin();
                renderizarCardsUsuarios();
            }
        });
    });

    // Evento para salvar edição
    document.getElementById('btn-salvar-edicao')?.addEventListener('click', () => {
        const id = parseInt(document.getElementById('jogoId').value); // Agora usando jogoId
        const novoNome = document.getElementById('editar-nome').value;
        const novaDescricao = document.getElementById('editar-descricao').value;
        const novaImagemInput = document.getElementById('editar-imagem');

        // Se não foi selecionada nova imagem, passa null
        if (!novaImagemInput.files[0]) {
            if (editarJogo(id, novoNome, novaDescricao, null)) {
                alert('Jogo atualizado com sucesso!');
                bootstrap.Modal.getInstance(document.getElementById('modalEditarJogo')).hide();
                renderizarTabelaAdmin();
                renderizarCardsUsuarios();
            }
            return;
        }

        // Se tem nova imagem, converte para base64
        carregarImagemComoBase64(novaImagemInput.files[0], (novaImagemBase64) => {
            if (editarJogo(id, novoNome, novaDescricao, novaImagemBase64)) {
                alert('Jogo atualizado com sucesso!');
                bootstrap.Modal.getInstance(document.getElementById('modalEditarJogo')).hide();
                renderizarTabelaAdmin();
                renderizarCardsUsuarios();
            }
        });
    });
    // Inicialização automática das views corretas
    if (document.getElementById('jogos-tbody')) {
        renderizarTabelaAdmin(); // Se existir tabela, é o admin
    }
    if (document.getElementById('jogos-container')) {
        renderizarCardsUsuarios(); // Se existir container, é a página de jogos
    }
}