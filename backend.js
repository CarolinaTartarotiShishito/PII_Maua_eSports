const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let avisos = [];
let jogos = [];

app.get('/api/avisos', (req, res) => {
  res.json(avisos);
});

app.post('/api/avisos', (req, res) => {
  const { titulo, descricao, data } = req.body;
  if (titulo && descricao && data) {
    avisos.push({ titulo, descricao, data });
    res.status(201).json({ message: 'Aviso adicionado com sucesso' });
  } else {
    res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
});

app.get('/api/jogos', (req, res) => {
  res.json(jogos);
});

app.post('/api/jogos', (req, res) => {
  const { titulo, timeA, timeB, horario, aoVivo, dataInicio, dataFim, tipo } = req.body;
  if (titulo && timeA && timeB && horario && dataInicio && dataFim) {
    jogos.push({ titulo, timeA, timeB, horario, aoVivo, dataInicio, dataFim, tipo });
    res.status(201).json({ message: 'Jogo adicionado com sucesso' });
  } else {
    res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.get('/api/instagram-posts', async (req, res) => {
  const token = process.env.INSTAGRAM_TOKEN;

  if (!token) {
    return res.status(200).json([]);
  }

  const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&access_token=${token}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.data.slice(0, 3));
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    res.status(500).json({ error: "Erro ao buscar posts do Instagram" });
  }
});

app.post('/api/set-token', (req, res) => {
  const novoToken = req.body.token;
  const conteudo = fs.readFileSync('.env', 'utf-8');
  const atualizado = conteudo.replace(/INSTAGRAM_TOKEN=.*/, `INSTAGRAM_TOKEN=${novoToken}`);
  fs.writeFileSync('.env', atualizado);
  res.sendStatus(200);
});