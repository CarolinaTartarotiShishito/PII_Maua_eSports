// scripts/PopUpFront.js
async function checkStreamerStatus() {
    try {
        const res = await fetch('http://localhost:3000/status');
        const data = await res.json();
        if (data.online) {
            document.getElementById('twitch-popup').style.display = 'flex';
        } else {
            document.getElementById('twitch-popup').style.display = 'none';
        }
    } catch (err) {
        console.error('Erro ao verificar status:', err);
        document.getElementById('twitch-popup').style.display = 'none';
    }
}
checkStreamerStatus();
setInterval(checkStreamerStatus, 60000);