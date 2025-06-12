document.addEventListener("DOMContentLoaded", async function() {
  const modalidades = await pegarModalidades();
  const jogos = await descobrirJogoPeloNomeDoTime(modalidades);
  console.log(jogos)
  renderJogos(jogos);
  // prepararAbaMembros('#modalidades-container');
});

async function descobrirJogoPeloNomeDoTime(modalidades) {
  let jogosOficiais = await carregarJogosJogadores();
  const resultado = {};
  
  for (let jogo of jogosOficiais) {
    resultado[jogo.nome] = new Set();
  }
  for (let modalidade of modalidades) {
    const nomeTime = modalidade.Name.toLowerCase();
    for (let jogo of jogosOficiais) {
      const nomeJogo = jogo.nome.toLowerCase();
      
      if (nomeTime.includes(nomeJogo)) {
        resultado[jogo.nome].add(modalidade.Name);
      }
    }
  }
  const resultadoFinal = {};
  for (let jogo in resultado) {
    resultadoFinal[jogo] = Array.from(resultado[jogo]);
  }
  
  return resultadoFinal;
}

// Função para carregar jogos do servidor
async function carregarJogosJogadores() {
  try {
      const response = await axios.get(`http://localhost:3000/jogos`);
      jogos = response.data;
      return jogos;
  } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      alert('Erro ao carregar jogos do servidor!');
      return [];
  }
}

// async function pegarModalidades() {
//     const modalidadesEndpoint = "/modalidades";
//     const urlCompleta = `${protocolo}${baseURL}${modalidadesEndpoint}`;
//     const response = (await axios.get(urlCompleta)).data;
//     modalidades = Object.values(response);
//     return modalidades;
// }

function renderJogos(jogos) {
  const container = document.getElementById("modalidades-container");
  container.innerHTML = "";

  for (const nomeJogo in jogos) {
    const nomeJogoDiv = document.createElement("div");
    nomeJogoDiv.className = "nome-jogo mt-5 mb-2";
    nomeJogoDiv.innerHTML = `<h3 class="nome-do-jogo"><b>${nomeJogo}</b></h3>`;
    container.appendChild(nomeJogoDiv);

    const times = jogos[nomeJogo];

    const botoesWrapper = document.createElement("div");
    botoesWrapper.className = "botoes-times mb-3";

    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "cards-wrapper";

    let primeiroBotao = null;

    times.forEach((time, index) => {
      const botao = document.createElement("button");
      botao.className = "botao-time btn btn-outline-primary me-2 mb-2";
      botao.textContent = `Equipe ${time}`;

      botao.onclick = async () => {
        botoesWrapper.querySelectorAll(".botao-time").forEach(btn => {
          btn.classList.remove("selecionado");
        });
        botao.classList.add("selecionado");
        cardsWrapper.innerHTML = "";

        const jogadores = await buscarJogadores(time);
        console.log(jogadores)

        if (jogadores.length === 0) {
          cardsWrapper.innerHTML = "<p>Nenhum jogador encontrado.</p>";
        } else {
          jogadores.forEach((jogador) => {
            const iniciais = getIniciais(jogador.NomeCompleto);
            const card = document.createElement("div");
            card.className = "card-container";
            card.innerHTML = `
              <div class="titulo">Jogador</div>
              <div class="circle">${iniciais}</div>
              <div class="info-box">
                <div class="nome">Nickname: ${jogador.Nickname}</div>
                <div class="funcao">Função: ${jogador.Cargo}</div>
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

