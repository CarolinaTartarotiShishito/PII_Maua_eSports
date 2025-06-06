const modalidades = {
  "Counter Strike 2": [
    { "id": "641246ec14a24f13c339bb1f", "time": "A" },
    { "id": "641902c127cd51b2d0f2bd92", "time": "B" }
  ],
  "FIFA 25": [{ "id": "64408e2748ac52dbe2d7af62", "time": "A" }],
  "Rocket Legue": [{ "id": "63641abd9328c1ab1e364c86", "time": "A" }],
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

document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/trains")
    .then((res) => res.json())
    .then((trains) => {
      renderModalidades(trains);
    });
});

function renderModalidades(trains) {
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

