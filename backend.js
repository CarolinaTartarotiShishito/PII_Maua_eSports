const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const defaultTrains = require('./defaultTrains.json');
const defaultModalities = require('./defaultModalities.json');
app.use(cors());
app.use(express.json());

let avisos = [];
let jogos = [];

app.get('/api/avisos', (req, res) => {
  res.json(avisos);
});



app.get('/trains', (req, res) => {
  // Retorna um array com os objetos, cada um com seu ID
  const trains = Object.entries(defaultTrains).map(([id, obj]) => ({
    id,
    ...obj
  }));
  res.json(trains);
});

app.get('/modalities', (req, res) => {
  // Retorna só os valores (array de modalidades)
  res.json(Object.values(modalities));
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
// scripts/banco.js

app.use(bodyParser.json());

// --- Authentication Middleware ---
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer frontendmauaesports') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// In-memory copies for runtime
let trains = JSON.parse(JSON.stringify(defaultTrains));
let modalities = JSON.parse(JSON.stringify(defaultModalities));

// --- Reset Data Every 24 Hours ---
function resetData() {
  trains = JSON.parse(JSON.stringify(defaultTrains));
  modalities = JSON.parse(JSON.stringify(defaultModalities));
  console.log('Data has been reset to default values.');
}
setInterval(resetData, 24 * 60 * 60 * 1000);

// --- API Routes ---

// GET /trains/all
// Accepts query parameters: "StartTimestamp>", "StartTimestamp<", and "Status"
app.get('/trains/all', authenticate, (req, res) => {
  let filteredTrains = trains;
  const startTimestampGt = req.query['StartTimestamp>'];
  const startTimestampLt = req.query['StartTimestamp<'];
  const status = req.query['Status'];

  if (startTimestampGt) {
    filteredTrains = filteredTrains.filter(t => t.StartTimestamp > Number(startTimestampGt));
  }
  if (startTimestampLt) {
    filteredTrains = filteredTrains.filter(t => t.StartTimestamp < Number(startTimestampLt));
  }
  if (status) {
    filteredTrains = filteredTrains.filter(t => t.Status === status);
  }

  res.json(filteredTrains);
});

// GET /modality/all
// Accepts an optional query parameter "Tag". If provided, only returns modalities with matching Tag.
app.get('/modality/all', authenticate, (req, res) => {
  const tag = req.query['Tag'];
  const result = {};
  for (const key in modalities) {
    if (modalities.hasOwnProperty(key)) {
      const mod = modalities[key];
      if (!tag || mod.Tag === tag) {
        result[key] = mod;
      }
    }
  }
  res.json(result);
});

// PATCH /modality with CRON validation
// Expects a JSON body with at least "_id" and "ScheduledTrainings"
app.patch('/modality', authenticate, (req, res) => {
  const { _id, ScheduledTrainings } = req.body;
  if (!_id) {
    return res.status(400).json({ error: 'Missing _id in request body' });
  }
  if (!modalities[_id]) {
    return res.status(404).json({ error: 'Modality not found' });
  }
  if (!Array.isArray(ScheduledTrainings)) {
    return res.status(400).json({ error: 'ScheduledTrainings must be an array' });
  }
  
  // Simple regex to validate a 6-field CRON expression (seconds, minutes, hours, day-of-month, month, day-of-week)
  const cronRegex = /^(\d{1,2}|\*)\s+(\d{1,2}|\*)\s+(\d{1,2}|\*)\s+(\d{1,2}|\*)\s+(\d{1,2}|\*)\s+(\d{1,2}|\*)$/;
  
  for (const training of ScheduledTrainings) {
    if (!training.Start || !training.End) {
      return res.status(400).json({ error: 'Each ScheduledTraining must have Start and End' });
    }
    if (!cronRegex.test(training.Start)) {
      return res.status(400).json({ error: `Invalid CRON expression for Start: ${training.Start}` });
    }
    if (!cronRegex.test(training.End)) {
      return res.status(400).json({ error: `Invalid CRON expression for End: ${training.End}` });
    }
  }

  modalities[_id].ScheduledTrainings = ScheduledTrainings;
  res.json({ message: 'Item updated' });
});

app.get('/teams', (req, res) => {
  res.json([
    { name: "Time A" },
    { name: "Time B" }
  ]);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
