// === Avisos ===
async function carregarAvisos() {
  const container = document.getElementById('listaAvisos');
  try {
    const resposta = await fetch('http://localhost:3000/api/avisos');
    const avisos = await resposta.json();

    container.innerHTML = '';
    avisos.forEach(a => {
      const card = document.createElement('div');
      card.className = 'aviso-card mb-3 p-3 rounded bg-dark text-light shadow';

      card.innerHTML = `
        <div class="d-flex justify-content-between">
          <h6>${a.titulo}</h6>
          <span class="text-muted">${formatarData(a.data)}</span>
        </div>
        <p class="mb-0">${a.descricao}</p>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p class="text-danger">Erro ao carregar avisos.</p>';
  }
}

// === Jogos ===
async function carregarJogos() {
  const container = document.getElementById('listaJogos');
  try {
    const resposta = await fetch('http://localhost:3000/api/jogos');
    const jogos = await resposta.json();

    container.innerHTML = '';
    jogos.forEach(j => {
      const card = document.createElement('div');
      card.className = 'jogo-card mb-3 p-3 rounded bg-dark text-light shadow';

      card.innerHTML = `
        <h6>${j.titulo}</h6>
        <div class="d-flex justify-content-between">
          <span>BO3</span>
          <span>${j.timeA}</span>
          <span>X</span>
          <span>${j.timeB}</span>
          <span>${j.horario}</span>
          ${j.aoVivo ? '<span class="text-danger fw-bold">AO VIVO 🔴</span>' : ''}
        </div>
        <small class="text-muted">${formatarPeriodo(j.dataInicio, j.dataFim)}</small>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p class="text-danger">Erro ao carregar jogos.</p>';
  }
}

// === Funções auxiliares ===
function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR');
}

function formatarPeriodo(inicio, fim) {
  const d1 = new Date(inicio).toLocaleDateString('pt-BR');
  const d2 = new Date(fim).toLocaleDateString('pt-BR');
  return `${d1} – ${d2}`;
}

async function carregarPostsInstagram() {
  const containers = document.querySelectorAll('.instagram-post');

  try {
    const resposta = await fetch('http://localhost:3000/api/instagram-posts');
    const posts = await resposta.json();

    if (!posts || posts.length === 0) {
      throw new Error("Sem posts ou token");
    }

    posts.forEach((post, i) => {
      const container = containers[i];
      if (!container) return;

      const isVideo = post.media_type === "VIDEO";
      const imageUrl = !isVideo ? (post.media_url || post.thumbnail_url || '') : '';

      container.classList.remove('skeleton');

      if (imageUrl) {
        container.innerHTML = `
          <a href="${post.permalink}" target="_blank">
            <img src="${imageUrl}" alt="Post Instagram" />
          </a>
        `;
      } else if (isVideo) {
        container.innerHTML = `
          <a href="${post.permalink}" target="_blank" class="d-flex justify-content-center align-items-center bg-black text-white fs-1" style="height: 100%; text-decoration: none;">
            ▶
          </a>
        `;
      } else {
        container.innerHTML = `<p>Sem imagem</p>`;
      }
    });
  } catch (erro) {
    console.warn("⚠️ Erro ao carregar feed do Instagram:", erro);

    // Mostra "Feed indisponível" nos 3 cards
    containers.forEach(container => {
      container.classList.remove('skeleton');
      container.innerHTML = `<p>Feed indisponível</p>`;
    });
  }
}

document.addEventListener("DOMContentLoaded", carregarPostsInstagram);

// === Inicialização ===
carregarAvisos();
carregarJogos();