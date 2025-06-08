const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const User = require('./models/user'); // Importe o model
const fetch = require('node-fetch');
const urlBase = 'https://API-Esports.lcstuber.net/';
const modalidadesEndpoint = 'modality/';
const treinosEndpoint = 'treinos';
const access_token = 'frontendmauaesports';
const jwt = require('jsonwebtoken');

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

// Código para pegar as modalidades da API deles (usar de referência)
app.get('/modalidades', async (req, res) => {
  const urlModalidades = `${urlBase}${modalidadesEndpoint}all`
  const response = await fetch(urlModalidades, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  });
  const modalidades = await response.json();
  res.json(modalidades);
});

app.get('/treinos', async (req, res) => {
  const urlTreinos = `${urlBase}${treinosEndpoint}all`;
  const response = await fetch(urlTreinos, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  });
  const treinos = await response.json();
  res.json(treinos);
})

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

// Conecte ao MongoDB
mongoose.connect('mongodb+srv://esportsuser:esportspass123@cluster0.imjcz.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado!'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Exemplo de rota para criar um usuário
app.post('/usuarios', async (req, res) => {
    try {
        const novoUsuario = new User(req.body);
        await novoUsuario.save();
        res.status(201).json(novoUsuario);
    } catch (err) {
        res.status(400).json({erro: err.message });
    }
});

// Código para buscar usuários no banco de dados
app.get('/usuarios', async (req, res) => {
    const usuarios = await User.find().sort({
      Cargo: -1, // desendente (Z-A)
      NomeCompleto: -1 // desendente (Z-A)
    });
    res.json(usuarios)
});

// Verifica se o usuário com o email passado está cadastrado no banco de dados
app.post('/buscaUsuario', async (req, res) => {
    const email = req.body.email;

    const usuarioExiste = await User.findOne({ Email: email });

    if (!usuarioExiste) {
        return res.status(401).json({ mensagem: "Usuário não está cadastrado!" });
    }

    const token = jwt.sign (
        {Email: email},
        "id-secreto",
        {expiresIn: "1h"}
    )

    res.status(200).json({cargo: usuarioExiste.Cargo, token: token});
});

app.post('/deletaUsuarios', async (req, res) => {
  try {
    await User.deleteOne({ Email: req.body.Email });
    res.status(200).json();
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
  }
});

// Inicie o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});