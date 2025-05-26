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
            const lista = document.getElementById("lista-membros-ul");
            if (!lista) return;

            fetch("http://localhost:3000/trains")
                .then(res => res.json())
                .then(trains => {
                    lista.innerHTML = "";
                    if (!trains.length) {
                        lista.innerHTML = "<li>Nenhum membro encontrado.</li>";
                        return;
                    }
                    trains.forEach(train => {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>ID:</strong> ${train.id} &mdash; <strong>Nome:</strong> ${train.Name || "Sem nome"}`;
                        lista.appendChild(li);
                    });
                })
                .catch(err => {
                    lista.innerHTML = `<li>Erro ao carregar membros: ${err.message}</li>`;
                });
        }
        if (nomeAba === "inicio") inicializarInicio();
        // Adicione outras abas aqui se necessário
    }

    function inicializarInicio() {
        // ...seu código da aba início...
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


    // === FUNÇÕES DE INICIALIZAÇÃO POR ABA ===
    function inicializarScriptEspecifico(aba) {
        if (aba == 'inicio') inicializarInicio();
        // Quando for colcoar outras abas:
        // if (aba === 'jogos') inicializarJogos();
    }

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

