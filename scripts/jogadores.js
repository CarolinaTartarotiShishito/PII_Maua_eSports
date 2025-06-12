const modalidades = {
  "Counter Strike 2": [
    { "id": "641246ec14a24f13c339bb1f", "time": "A" },
    { "id": "641902c127cd51b2d0f2bd92", "time": "B" }
  ],
  "FIFA 25": [{ "id": "64408e2748ac52dbe2d7af62", "time": "A" }],
  "Rocket League": [{ "id": "63641abd9328c1ab1e364c86", "time": "A" }],
  "League of Legends": [
    { "id": "6418aa5f9dec6ec29dc77be9", "time": "A" },
    { "id": "64e16a08639c17d83824cfa8", "time": "B" }
  ],
  "TFT": [
    { "id": "642cc2bf81b714e8f342ccfa", "time": "A" },
    { "id": "64f62ee5257dd75e74425e0c", "time": "B" }
  ],
  "Rainbow Six": [
    { "id": "6429eebd5ee71b5d45436aa3", "time": "A" },
    { "id": "642b6ac5bc274fddaadf57e3", "time": "Academy" }
  ],
  "valorant": [
    { "id": "6360944b04a823de3a359357", "time": "Feminina" },
    { "id": "64124b4c14a24f13c339bb20", "time": "Misto Blue" },
    { "id": "64124b9114a24f13c339bb21", "time": "Misto Black" }
  ]
};

document.addEventListener("DOMContentLoaded", async function() {
  fetch("http://localhost:5000/trains/all")
    .then((res) => res.json())
    .then((trains) => {
      // renderModalidades(trains);
    });
  const modalidades = await pegarModalidades();
  // let modalidade = modalidades.filter(modalidade => modalidade.Name === time)[0];
  console.log(modalidades);
  renderModalidades(modalidades);
  // prepararAbaMembros('#modalidades-container');
});

async function pegarModalidades() {
    const modalidadesEndpoint = "/modalidades";
    const urlCompleta = `${protocolo}${baseURL}${modalidadesEndpoint}`;
    const response = (await axios.get(urlCompleta)).data;
    modalidades = Object.values(response);
    return modalidades;
}

function renderModalidades(modalidades) {
  const container = document.getElementById("modalidades-container");
  container.innerHTML = "";

  for (const nomeJogo in modalidades) {
    const nomeJogoDiv = document.createElement("div");
    nomeJogoDiv.className = "nome-jogo mt-5 mb-2";
    nomeJogoDiv.innerHTML = `<h3 class="nome-do-jogo"><b>${nomeJogo}</b></h3>`;
    container.appendChild(nomeJogoDiv);

    const times = modalidades[nomeJogo];

    const botoesWrapper = document.createElement("div");
    botoesWrapper.className = "botoes-times mb-3";

    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "cards-wrapper";

    let primeiroBotao = null;

    times.forEach((time, index) => {
      const botao = document.createElement("button");
      botao.className = "botao-time btn btn-outline-primary me-2 mb-2";
      botao.textContent = `Equipe ${time.time}`;

      botao.onclick = () => {
        botoesWrapper.querySelectorAll(".botao-time").forEach(btn => {
          btn.classList.remove("selecionado");
        });
        botao.classList.add("selecionado");
        cardsWrapper.innerHTML = "";

        const treinosDoTime = trains.filter((t) => t.ModalityId == time.id);
        const jogadores = [];

        treinosDoTime.forEach((treino) => {
          (treino.AttendedPlayers || []).forEach((player) => {
            if (!jogadores.find((j) => j.PlayerId == player.PlayerId)) {
              jogadores.push(player);
            }
          });
        });

        if (jogadores.length === 0) {
          cardsWrapper.innerHTML = "<p>Nenhum jogador encontrado.</p>";
        } else {
          jogadores.forEach((jogador) => {
            const iniciais = jogador.PlayerId.slice(-2).toUpperCase();
            const card = document.createElement("div");
            card.className = "card-container";
            card.innerHTML = `
              <div class="titulo">Jogador</div>
              <div class="circle">${iniciais}</div>
              <div class="info-box">
                <div class="nome">ID: ${jogador.PlayerId}</div>
                <div class="funcao">Função desconhecida</div>
              </div>
            `;
            cardsWrapper.appendChild(card);
          });
        }
      };

      if (index === 0) primeiroBotao = botao;
      botoesWrapper.appendChild(botao);
    });

    container.appendChild(botoesWrapper);
    container.appendChild(cardsWrapper);

    if (primeiroBotao) primeiroBotao.click(); // Isso coloca o conteudo na página sem precisar clicar. Ele simula um clique
  }
}

// Nenhum dado estático aqui. Tudo será buscado da sua API.
// async function prepararAbaMembros(idSeletor) {
//     exibeTimes(idSeletor);
//     const tabelaMembros = document.querySelector('#lista-membros');
//     const corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0];
//     corpoTabela.innerHTML = '';
//     const todosMembros = await pegaMembros();
//     let membrosFiltrados = [...todosMembros];
//     const seletorCargo = document.querySelector("#filtro-cargos-select");
//     const seletorTime = document.querySelector(idSeletor);

//     async function aplicarFiltros() {
//         const cargoSelecionado = seletorCargo.value;
//         const timeSelecionado = seletorTime.value;
//         membrosFiltrados = [...todosMembros];
//         if (cargoSelecionado && cargoSelecionado !== "Todos") {
//             membrosFiltrados = membrosFiltrados.filter(membro => membro.Cargo === cargoSelecionado);
//         }
//         if (timeSelecionado && timeSelecionado !== "Todos") {
//             membrosFiltrados = membrosFiltrados.filter(membro => membro.Time === timeSelecionado);
//         }
//         corpoTabela.innerHTML = '';
//         for (const membro of membrosFiltrados) {
//             await exibeMembro(membro, corpoTabela, localStorage.getItem("email"));
//         }
//     }

//     await aplicarFiltros();
//     seletorCargo.addEventListener('change', aplicarFiltros);
//     seletorTime.addEventListener('change', aplicarFiltros);
// }

// document.addEventListener("DOMContentLoaded", async () => {
//     try {
//         // 1. Buscamos TODOS os dados necessários de uma só vez quando a página carrega.
//         //    Isso é eficiente pois evita múltiplas chamadas à API a cada clique.
//         const [modalidades, todosOsJogadores] = await Promise.all([
//             pegarModalidades(), // Função que você já tem em frontend.js
//             pegaMembros()       // Função que você já tem em frontend.js
//         ]);

//         // 2. Chamamos a função para desenhar a página, passando os dados que buscamos.
//         renderPaginaJogadores(modalidades, todosOsJogadores);
//         // prepararAbaMembros('#modalidades-container');

//     } catch (error) {
//         console.error("Erro ao carregar dados da página de jogadores:", error);
//         const container = document.getElementById("modalidades-container");
//         container.innerHTML = "<p class='text-danger'>Não foi possível carregar os dados. Tente recarregar a página.</p>";
//     }
// });

// function renderPaginaJogadores(modalidades, todosOsJogadores) {
//     const container = document.getElementById("modalidades-container");
//     container.innerHTML = "";

//     // Função que filtra as modalidades por jogo
//     const times = filtraModalidades();

//     // Loop através de cada JOGO (modalidade)
//     modalidades.forEach(modalidade => {
//         const nomeJogo = modalidade.Name;
//         console.log(modalidade)
//         // Assumindo que sua API retorna as equipes dentro de um array chamado 'Teams'
//         const times = modalidade.Times || [];
//         console.log(times)

//         // Cria o título do jogo (ex: <h3>League of Legends</h3>)
//         const nomeJogoDiv = document.createElement("div");
//         nomeJogoDiv.className = "nome-jogo mt-5 mb-2";
//         nomeJogoDiv.innerHTML = `<h3 class="nome-do-jogo"><b>${nomeJogo}</b></h3>`;
//         container.appendChild(nomeJogoDiv);

//         // Cria um container para os botões e para os cards de jogadores
//         const botoesWrapper = document.createElement("div");
//         botoesWrapper.className = "botoes-times mb-3";
//         const cardsWrapper = document.createElement("div");
//         cardsWrapper.className = "cards-wrapper";

//         if (times.length === 0) {
//             botoesWrapper.innerHTML = "<p>Nenhuma equipe cadastrada para esta modalidade.</p>";
//         }

//         // Loop através de cada EQUIPE dentro do jogo
//         times.forEach(time => {
//             const botao = document.createElement("button");
//             botao.className = "botao-time btn btn-outline-primary me-2 mb-2";
//             botao.textContent = `Equipe ${time.time}`; // ex: Equipe A, Equipe Feminina

//             // 3. A MÁGICA ACONTECE AQUI: Lógica do clique no botão
//             botao.onclick = () => {
//                 // Remove a seleção de outros botões
//                 botoesWrapper.querySelectorAll(".botao-time").forEach(btn => btn.classList.remove("selecionado"));
//                 botao.classList.add("selecionado");

//                 // Filtra a lista completa de jogadores para encontrar os que pertencem a este JOGO.
//                 // NOTA: Veja a observação importante no final da resposta sobre isso.
//                 const jogadoresDoTime = todosOsJogadores.filter(jogador => jogador.Time === nomeJogo);

//                 cardsWrapper.innerHTML = ""; // Limpa os cards antigos

//                 if (jogadoresDoTime.length === 0) {
//                     cardsWrapper.innerHTML = "<p>Nenhum jogador encontrado para esta modalidade.</p>";
//                 } else {
//                     // Cria um card para cada jogador encontrado
//                     jogadoresDoTime.forEach(jogador => {
//                         // Usando a função getIniciais que você já tem em frontend.js
//                         const iniciais = getIniciais(jogador.NomeCompleto); 
                        
//                         const card = document.createElement("div");
//                         card.className = "card-container";
//                         // Card de jogador muito mais completo e informativo!
//                         card.innerHTML = `
//                             <div class="titulo">${jogador.Cargo || 'Jogador'}</div>
//                             <div class="circle">${iniciais}</div>
//                             <div class="info-box">
//                                 <div class="nome">${jogador.Nickname}</div>
//                                 <div class="funcao">${jogador.NomeCompleto}</div>
//                             </div>
//                         `;
//                         cardsWrapper.appendChild(card);
//                     });
//                 }
//             };

//             botoesWrapper.appendChild(botao);
//         });

//         container.appendChild(botoesWrapper);
//         container.appendChild(cardsWrapper);
//     });

//     // Simula o clique no primeiro botão da página para que ela já carregue com jogadores
//     if (container.querySelector('.botao-time')) {
//         container.querySelector('.botao-time').click();
//     }
// }

function descobrirJogoPeloNomeDoTime(nomeDoTime) {
  const JOGOS_OFICIAIS = carregarJogosJogadores();
  const nomeTimeMinusculo = nomeDoTime.toLowerCase();
  const jogoEncontrado = JOGOS_OFICIAIS.find(jogo => 
    nomeTimeMinusculo.includes(jogo.toLowerCase())
  );
  return jogoEncontrado || null;
}
// Função para carregar jogos do servidor
  async function carregarJogosJogadores() {
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