async function checkTwitchChannelStatus() {
    const clientId = 'prf99e8zzq9rsudft67tscm6lshgr2'; // Substitua pelo seu Client ID da Twitch
    const accessToken = '55nmx93vodgvobge7f2af1fmtjouot'; // Substitua pelo seu Access Token da Twitch
    const channelName = 'mauaesports';

    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            // Canal está online
            document.getElementById('twitch-popup').style.display = 'flex';
        } 
        else {
            // Canal está offline
            document.getElementById('twitch-popup').style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao verificar status do canal:', error);
    }
}

checkTwitchChannelStatus();