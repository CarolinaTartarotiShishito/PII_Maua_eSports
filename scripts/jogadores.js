const modalidades = [
  { id: "641246ec14a24f13c339bb1f", nome: "Counter Strike 2 A" },
  { id: "641902c127cd51b2d0f2bd92", nome: "Counter Strike 2 B" },
  { id: "64408e2748ac52dbe2d7af62", nome: "FIFA 25" },
  { id: "63641abd9328c1ab1e364c86", nome: "Rocket League" },
  { id: "6418aa5f9dec6ec29dc77be9", nome: "League of Legends A" },
  { id: "64e16a08639c17d83824cfa8", nome: "League of Legends B" },
  {id: "642cc2bf81b714e8f342ccfa", nome: "TFT A" },
  {id: "64f62ee5257dd75e74425e0c", nome: "TFT B" },
  {id: "6429eebd5ee71b5d45436aa3", nome: "Rainbow Six" },
  {id: "642b6ac5bc274fddaadf57e3", nome: "Rainbow Six Academy" },
  {id: "6360944b04a823de3a359357", nome: "Valorant Feminino" },
  {id: "64124b4c14a24f13c339bb20", nome: "Valorant Misto Blue" },
  {id: "64124b9114a24f13c339bb21", nome: "Valorant Misto Black" },

  // Adicione outras modalidades aqui
];

fetch('http://localhost:3000/trains')
  .then(res => res.json())
  .then(trains => {
    renderModalidades(trains);
  });

function renderModalidades(trains) {
  const container = document.getElementById('modalidades-container'); 
  container.innerHTML = ''; // Limpa o conteúdo

  modalidades.forEach(modalidade => {
    // Cria o título do jogo
    const nomeJogoDiv = document.createElement('div');
    nomeJogoDiv.className = 'nome-jogo mt-5 mb-4';
    nomeJogoDiv.innerHTML = `<h3 class="nome-do-jogo"><b>${modalidade.nome}</b></h3>`;
    container.appendChild(nomeJogoDiv);

    // Filtra os treinos dessa modalidade
    const treinosDaModalidade = trains.filter(t => t.ModalityId == modalidade.id);

    // Coleta todos os jogadores únicos dessa modalidade
    const jogadores = [];
    treinosDaModalidade.forEach(treino => {
      (treino.AttendedPlayers || []).forEach(player => {
        if (!jogadores.find(j => j.PlayerId == player.PlayerId)) {
          jogadores.push(player);
        }
      });
    });

    // Cria o wrapper dos cards
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'cards-wrapper';

    if (jogadores.length == 0) {
      cardsWrapper.innerHTML = '<p>Nenhum jogador encontrado.</p>';
    } else {
      jogadores.forEach(jogador => {
        // Aqui você pode buscar mais informações do jogador se tiver (nome, função, etc)
        // Por enquanto, só mostra o ID
        const iniciais = jogador.PlayerId.slice(-2).toUpperCase(); // Exemplo: últimas letras do ID
        const card = document.createElement('div');
        card.className = 'card-container';
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

    container.appendChild(cardsWrapper);
  });
}

