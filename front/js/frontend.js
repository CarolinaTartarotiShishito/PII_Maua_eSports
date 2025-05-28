// Configuração do MSAL (login Microsoft)
const msalConfig = {
    auth: {
        clientId: "5c2f6178-194c-414d-a1f1-6c91a80eff28",
        authority: "https://login.microsoftonline.com/maua.br", 
        knownAuthorities: ["login.microsoftonline.com"],
        redirectUri: window.location.origin + "/aut",
        protocolMode: "AAD" 
    },
    system: {
        loggerOptions: {
        loggerCallback: (level, message) => {
            console.log("MSAL Log:", message);
        }
        }
    }
    };

// Cria a instância do MSAL
const msalInstance = new msal.PublicClientApplication(msalConfig);
    
async function fazerLogin (){
    try {
        const loginRequest = {
            scopes: ["openid", "profile", "User.Read"],
            prompt: 'select_account'
        };
        
        // Inicia o login via popup
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        
        console.log("Login bem-sucedido!", loginResponse);
        
        // Aqui você pode redirecionar o usuário ou mostrar os dados
        alert(`Bem-vindo, ${loginResponse.account.name}!`);
    } catch (error) {
        console.error("Erro durante o login:", error);
        alert("Falha no login. Por favor, tente novamente.");
    }
}

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