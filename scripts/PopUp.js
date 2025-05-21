require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
const PORT = 3000;

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const STREAMER_LOGIN = 'oclenis'; // altere para o nome do streamer desejado

let accessToken = '';

async function getAccessToken() {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
        method: 'POST'
    });
    const data = await res.json();
    accessToken = data.access_token;
}

app.get('/status', async (req, res) => {
    if (!accessToken) await getAccessToken();

    let response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${STREAMER_LOGIN}`, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        }
    });

    let data = await response.json();

    // Se o token for inválido, tente renovar e refazer a requisição
    if (data.status === 401) {
        await getAccessToken();
        response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${STREAMER_LOGIN}`, {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`
            }
        });
        data = await response.json();
    }

    console.log('Resposta da Twitch:', data);

    const isLive = data.data && data.data.length > 0;
    res.json({ streamer: STREAMER_LOGIN, online: isLive });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});