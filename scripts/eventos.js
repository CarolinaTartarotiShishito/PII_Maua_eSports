
const API_URL = 'http://localhost:3000/eventos';

async function carregarAvisosEventos() {
  try {
    const res = await fetch(API_URL);
    const eventos = await res.json();
    const lista = document.getElementById('listaAvisos');
    lista.innerHTML = '';
    if (eventos.length === 0) {
      lista.innerHTML = '<li class="list-group-item">Nenhum aviso de evento no momento.</li>';
    } else {
      eventos.forEach(ev => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `<strong>${ev.nome}</strong>: ${ev.descricao}`;
        lista.appendChild(li);
      });
    }
  } catch (err) {
    document.getElementById('listaAvisos').innerHTML = '<li class="list-group-item text-danger">Erro ao carregar avisos.</li>';
    console.error('Erro ao carregar avisos de eventos:', err);
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

// === Instagram ===
async function carregarPostsInstagram() {
  const containers = document.querySelectorAll('.instagram-post');

  try {
    const resposta = await fetch('http://localhost:3000/api/instagram-posts');
    const posts = await resposta.json();

    if (!posts || posts.length === 0) throw new Error("Sem posts ou token");

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
          <a href="${post.permalink}" target="_blank"
             class="d-flex justify-content-center align-items-center bg-black text-white fs-1"
             style="height: 100%; text-decoration: none;">
            ▶
          </a>
        `;
      } else {
        container.innerHTML = `<p>Sem imagem</p>`;
      }
    });
  } catch (erro) {
    console.warn("Erro ao carregar feed do Instagram:", erro);
    containers.forEach(container => {
      container.classList.remove('skeleton');
      container.innerHTML = `<p>Feed indisponível</p>`;
    });
  }
}

// Função para criar evento
async function adicionarEvento(nome, descricao) {
    const resposta = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao })
    });
    const dados = await resposta.json();
}
// Listar eventos
async function listarEventos() {
    const resposta = await fetch('/api/eventos');
    return await resposta.json();
}

// Editar evento
async function editarEvento(id, dados) {
    const resposta = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    return await resposta.json();
}

// Excluir evento
async function excluirEvento(id) {
    const resposta = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE'
    });
    return await resposta.json();
}

// === Inicialização ao carregar a página ===
document.addEventListener("DOMContentLoaded", async function() {
  carregarPostsInstagram();
  // carregarAvisosEventos()
  // await prepararAviso();
  await exibeAviso('#aviso-nome', '#aviso-texto');
});

// async function criarAviso() { 
//   const 
//   const btnEditarQuemSomos = document.getElementById('btn-editar-quem-somos');
//   const textoQuemSomos = document.getElementById('quem-somos-texto');
//   const modalQuemSomos = new bootstrap.Modal(document.getElementById('modalEditarQuemSomos'));
//   const textareaQuemSomos = document.getElementById('textoQuemSomos');
//   const btnSalvarQuemSomos = document.getElementById('salvarQuemSomos');

//   if (btnEditarQuemSomos) {
//       btnEditarQuemSomos.addEventListener('click', function () {
//           textareaQuemSomos.value = textoQuemSomos.innerText;
//           modalQuemSomos.show();
//       });

//       btnSalvarQuemSomos.addEventListener('click', async function () {
//           // textoQuemSomos.innerText = textareaQuemSomos.value;
//           await novoSobre(); //chama função do frontend.js
//           modalQuemSomos.hide();
//           // mostrarNotificacao('Texto atualizado com sucesso!');
//       });
//   }
//   await exibeSobre('#quem-somos-texto');
// }