const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const multer = require('multer');
const jwt = require('jsonwebtoken');
// caminho para a API oficial:
// const urlAPI = 'https://API-Esports.lcstuber.net/';
// caminho para a API de testes:
const urlAPITeste = 'http://localhost:5000/';
const modalidadesEndpoint = 'modality/';
const treinosEndpoint = 'trains/';
const access_token = 'frontendmauaesports';
const User = require('./models/user');
const Jogo = require('./models/jogo');
const Sobre = require('./models/sobre');
const Aviso = require('./models/avisos');
const { url } = require('inspector');

// Middleware
app.use(cors());

app.use('/imagens', express.static(path.join(__dirname, 'imagens')));
app.use(express.json({ limit: '10mb' })); // Para JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Para formulários

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imagens/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Se estiver usando multer:
const upload = multer({ 
  storage: storage, // Usa o diskStorage configurado
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Código para pegar as modalidades da API deles (usar de referência)
app.get('/modalidades', async (req, res) => {
  const urlModalidades = `${urlAPITeste}${modalidadesEndpoint}all`
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
  const urlTreinos = `${urlAPITeste}${treinosEndpoint}all`;
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

// AVISOS
// Listar avisos
app.get('/avisos', async (req, res) => {
  let avisos = await Aviso.find();
  res.json(avisos);
});

// Adicionar aviso
app.post('/avisos', async (req, res) => {
  try{
    const novoAviso = new Aviso({ nome: req.body.nome, descricao: req.body.descricao});
    novoAviso.save();
    console.log(novoAviso);
    res.status(201).json(novoAviso);
  } catch (error) {
    res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
  }
});

// Editar aviso
app.post('/editarAvisos', async (req, res) => {
  try {
    const dadosAtualizados = req.body;
    await Aviso.updateOne({ _id: '684a9e8c5718500c9bab6d20' }, { $set: dadosAtualizados })
    res.status(201).json();
  }
  catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Excluir aviso
app.delete('/avisos', async (req, res) => {
  try {
    await Aviso.deleteOne({ _id: req.body.email });
    res.status(200).json();
  } catch (err) {
    console.error('Erro ao deletar aviso:', err);
  }
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
  } catch (error) {
    res.status(400).json({ erro: error.message });
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

  const token = jwt.sign(
    { Email: email },
    "id-secreto",
    { expiresIn: "1h" }
  )

  res.status(200).json({ cargo: usuarioExiste.Cargo, token: token });
});

app.post('/deletaUsuarios', async (req, res) => {
  try {
    await User.deleteOne({ Email: req.body.Email });
    res.status(200).json();
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
  }
});

app.get('/buscaEspecificaUsuario', async (req, res) => {
  try {
    const tipo = req.query.Tipo;
    const filtro = req.query.Filtro
    let usuarios = await User.find({ [tipo]: filtro }).sort({
      Cargo: -1, // desendente (Z-A)
      NomeCompleto: -1 // desendente (Z-A)
    });

    res.json(usuarios);

  } catch (error) {
    console.error('Erro ao buscar usuários: ', error);
  }
});

app.get('/dadosUsuario', async (req, res) => {
  try {
    let dados = await User.findOne({ Email: req.query.email });

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário: ', error);
  }
});

app.post('/editarUsuario', async (req, res) => {
  try {
    const dadosAtualizados = req.body;
    await User.updateOne({ Email: dadosAtualizados.Email }, { $set: dadosAtualizados })
    res.status(201).json();
  }
  catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Rotas
app.get('/jogos', async (req, res) => {
  try {
    const jogos = await Jogo.find().sort({ nome: 1 });
    console.log(jogos)
    res.json(jogos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/jogos', async (req, res) => {
  console.log('Body recebido:', req.body); // Debug importante
  const jogo = new Jogo({
    nome: req.body.nome,
    descricao: req.body.descricao,
    imagemUrl: req.body.imagemUrl
  });
  console.log(jogo);
  try {
    const novoJogo = await jogo.save();
    console.log(novoJogo);
    res.status(201).json(novoJogo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/jogos/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(jogo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/jogos/:id', async (req, res) => {
  try {
    await Jogo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Jogo deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para upload de imagens
app.post('/api/upload', upload.single('imagem'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo recebido'
      });
    }

    const imageUrl = `/imagens/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor ao processar upload'
    });
  }
});

app.patch('/treinos', async (req, res) => {
  try {
    const dados = req.body;
    const urlCompleta = `${urlAPITeste}${modalidadesEndpoint}`
    await fetch(urlCompleta, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(dados)
    });
    res.status(201).json()
  } catch (error) {
    console.error("Erro ao dar patch em modalidades: ", error);
  }
})

// Criar "sobre"
// app.post('/sobre', async (req, res) => {
//   try {
//     const sobre = new Sobre({ conteudo: req.body.conteudo });
//     await sobre.save();
//     res.status(201).json(sobre);
//   } catch (error) {
//     res.status(400).json({ erro: error.message });
//   }
// });

// Editar "sobre"
app.post('/editarSobre', async (req, res) => {
  try {
    const idSobre = "684a51b88d6f37edece66eb8";
    const sobre = await Sobre.updateOne(
      {_id: idSobre},
      { conteudo: req.body.conteudo }
    );
    if (!sobre) return res.status(404).json({ erro: 'Sobre não encontrado' });
    res.json(sobre);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Excluir "sobre"
// app.delete('/sobre/:id', async (req, res) => {
//   try {
//     const sobre = await Sobre.findByIdAndDelete(req.params.id);
//     if (!sobre) return res.status(404).json({ erro: 'Sobre não encontrado' });
//     res.json({ mensagem: 'Sobre excluído com sucesso' });
//   } catch (error) {
//     res.status(400).json({ erro: error.message });
//   }
// });

// Buscar todos os "sobre"
app.get('/exibeSobre', async (req, res) => {
  try {
    const sobre = await Sobre.find();
    res.json(sobre);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});
app.get('/usuarios', async (req, res) => {
    const usuarios = await User.find().sort({
      Cargo: -1, // desendente (Z-A)
      NomeCompleto: -1 // desendente (Z-A)
    });
    res.json(usuarios)
});

// Inicie o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});