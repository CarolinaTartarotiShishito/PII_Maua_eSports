const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front')));

let eventos = [];
let jogos = [];
let membros = [];

// EVENTOS
// Listar eventos
app.get('/eventos', (req, res) => {
  res.json(eventos);
});

// Adicionar evento
app.post('/eventos', (req, res) => {
  const { nome, descricao } = req.body;
  if (nome && descricao) {
    const novoEvento = { _id: Date.now().toString(), nome, descricao };
    eventos.push(novoEvento);
    res.status(201).json(novoEvento);
  } else {
    res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
  }
});

// Editar evento
app.put('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const evento = eventos.find(ev => ev._id === id);
  if (evento) {
    evento.nome = nome;
    evento.descricao = descricao;
    res.json(evento);
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
});

// Excluir evento
app.delete('/eventos/:id', (req, res) => {
  const { id } = req.params;
  const index = eventos.findIndex(ev => ev._id === id);
  if (index !== -1) {
    eventos.splice(index, 1);
    res.json({ message: 'Evento excluído com sucesso' });
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
});

// Alias para listar eventos na raiz
app.get('/', (req, res) => {
  res.json(eventos);
});

// Alias para adicionar evento na raiz
app.post('/', (req, res) => {
  const { nome, descricao } = req.body;
  if (nome && descricao) {
    const novoEvento = { _id: Date.now().toString(), nome, descricao };
    eventos.push(novoEvento);
    res.status(201).json(novoEvento);
  } else {
    res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
  }
});

// Alias para editar evento na raiz (ex: PUT /123)
app.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const evento = eventos.find(ev => ev._id === id);
  if (evento) {
    evento.nome = nome;
    evento.descricao = descricao;
    res.json(evento);
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
});

// Alias para excluir evento na raiz (ex: DELETE /123)
app.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = eventos.findIndex(ev => ev._id === id);
  if (index !== -1) {
    eventos.splice(index, 1);
    res.json({ message: 'Evento excluído com sucesso' });
  } else {
    res.status(404).json({ error: 'Evento não encontrado' });
  }
});

// JOGOS
app.get('/jogos', (req, res) => res.json(jogos));
app.post('/jogos', (req, res) => {
  const { nome, descricao } = req.body;
  if (nome && descricao) {
    const novoJogo = { _id: Date.now().toString(), nome, descricao };
    jogos.push(novoJogo);
    res.status(201).json(novoJogo);
  } else {
    res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
  }
});
app.put('/jogos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const jogo = jogos.find(j => j._id === id);
  if (jogo) {
    jogo.nome = nome;
    jogo.descricao = descricao;
    res.json(jogo);
  } else {
    res.status(404).json({ error: 'Jogo não encontrado' });
  }
});
app.delete('/jogos/:id', (req, res) => {
  const { id } = req.params;
  const index = jogos.findIndex(j => j._id === id);
  if (index !== -1) {
    jogos.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Jogo não encontrado' });
  }
});

// MEMBROS
app.get('/membros', (req, res) => res.json(membros));
app.post('/membros', (req, res) => {
  const { nome, cargo } = req.body;
  if (nome && cargo) {
    const novoMembro = { _id: Date.now().toString(), nome, cargo };
    membros.push(novoMembro);
    res.status(201).json(novoMembro);
  } else {
    res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
  }
});
app.put('/membros/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cargo } = req.body;
  const membro = membros.find(m => m._id === id);
  if (membro) {
    membro.nome = nome;
    membro.cargo = cargo;
    res.json(membro);
  } else {
    res.status(404).json({ error: 'Membro não encontrado' });
  }
});
app.delete('/membros/:id', (req, res) => {
  const { id } = req.params;
  const index = membros.findIndex(m => m._id === id);
  if (index !== -1) {
    membros.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Membro não encontrado' });
  }
});

// Endpoint para jogadores por modalidade
app.get('/jogadores-por-modalidade', (req, res) => {
  const trainsPath = path.join(__dirname, 'defaultTrains.json');
  const modalitiesPath = path.join(__dirname, 'defaultModalities.json');

  // Lê ambos os arquivos
  fs.readFile(trainsPath, 'utf8', (err, trainsData) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler defaultTrains.json' });
    fs.readFile(modalitiesPath, 'utf8', (err2, modalitiesData) => {
      if (err2) return res.status(500).json({ error: 'Erro ao ler defaultModalities.json' });

      let trains = [];
      let modalities = {};
      try {
        trains = JSON.parse(trainsData);
        modalities = JSON.parse(modalitiesData);
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao processar JSON' });
      }

      // Agrupa jogadores por modalidade
      const resultado = {};
      trains.forEach(train => {
        const modalidadeId = train.ModalityId;
        const modalidadeNome = modalities[modalidadeId]?.Name || modalidadeId;
        if (!resultado[modalidadeId]) {
          resultado[modalidadeId] = {
            modalidadeId,
            modalidadeNome,
            jogadores: new Set()
          };
        }
        train.AttendedPlayers.forEach(player => {
          resultado[modalidadeId].jogadores.add(player.PlayerId);
        });
      });

      // Converte Set para Array e prepara resposta
      const resposta = Object.values(resultado).map(item => ({
        modalidadeId: item.modalidadeId,
        modalidadeNome: item.modalidadeNome,
        jogadores: Array.from(item.jogadores)
      }));

      res.json(resposta);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

