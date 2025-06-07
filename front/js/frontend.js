const protocolo = 'http://'
const baseURL = 'localhost:3000'

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
    const loginRequest = {
        scopes: ["openid", "profile", "email", "User.Read", "User.ReadBasic.All"],
        prompt: 'select_account'
    };
    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        const buscaEndpoint = '/buscaUsuario';
        const urlCompleta = `${protocolo}${baseURL}${buscaEndpoint}`;
        const response = await axios.post(urlCompleta, {email: loginResponse.account.username});
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("cargo", response.data.cargo);
        localStorage.setItem("avatar", getIniciais(loginResponse.account.name));
        exibeAlerta(".alert-login", "Login efetuado com sucesso!", ['show', 'alert-success'], ['d-none'], 4000);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        console.error("Erro durante o login:", error);
        exibeAlerta(".alert-login", "Falha no login!", ['show', 'alert-danger'], ['d-none'], 4000);
    }
}

function getIniciais(nomeCompleto) {
  const nomes = nomeCompleto.split(' ');
  const primeiraLetra = nomes[0][0];
  const ultimaLetra = nomes.length > 1 ? nomes[nomes.length - 1][0] : '';
  return `${primeiraLetra}${ultimaLetra}`.toUpperCase();
}

async function exibeTimes(){
    const seletor = document.querySelector('#timesUsuarioSelect');
    const modalidadesEndpoint = '/modalidades';
    const urlCompleta = `${protocolo}${baseURL}${modalidadesEndpoint}`;
    const response = (await axios.get(urlCompleta)).data;
    const times = Object.values(response);
    for(let time of times){
        const opcao = document.createElement('option');
        opcao.innerHTML = time.Name;
        opcao.value = time.Name;
        seletor.appendChild(opcao);
    }
}

// adicionaar usuários ao banco de dados
async function novoUsuario() {
    const email = (document.querySelector('#emailUsuario')).value;
    const nome = (document.querySelector('#nomeUsuario')).value;
    const nickname = (document.querySelector('#nicknameUsuario')).value;
    const idDiscord = (document.querySelector('#idUsuario')).value;
    const cargo = (document.querySelector('#cargoUsuarioSelect')).value;
    const time = (document.querySelector('#timesUsuarioSelect')).value;
    if (email && nome && nickname && idDiscord && cargo) {
        if(email.includes('@maua.br')){
            try {
                const novoUsuarioEndpoint = "/usuarios";
                const urlCompletaUsuarios = `${protocolo}${baseURL}${novoUsuarioEndpoint}`;
                const modelo = {
                    Email: email,
                    NomeCompleto: nome,
                    Nickname: nickname,
                    IdDiscord: idDiscord,
                    Cargo: cargo,
                    Time: time // Time é opicional, caso não seja seleciondo, armazenará uma String vazia
                };
                const response = await axios.post(urlCompletaUsuarios, modelo)
                console.log(response);
                const modal = document.querySelector('#modalAdicionarMembro');
                modal.hide();
            }
            catch (e) {
                console.log(e);
            }    
        } else{
            alert(`O e-mail deve pertencer ao domínio do Instituto Mauá de Tecnologia ("@maua.br)!`);
        }
    } else {
        alert("Preencha todos os campos obrigatórios!");
        const modal = document.querySelector('#modalAdicionarMembro');
                modal.hide();
    }
}

// Prepara a página de membros
async function prepararAbaMembros(){
    let tabelaMembros = document.querySelector('#lista-membros');
    let corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0]
    const membrosEndpoint = "/usuarios";
    const urlCompletaMembros = `${protocolo}${baseURL}${membrosEndpoint}`;
    membros = (await axios.get(urlCompletaMembros)).data;
    for(membro of membros) {
        let linha = corpoTabela.insertRow(0);
        let celCargo = linha.insertCell(0);
        let celEmail = linha.insertCell(1);
        let celNome = linha.insertCell(2);
        let celTime = linha.insertCell(3);
        let celHoras = linha.insertCell(4);
        let celAcoes = linha.insertCell(5);
        let botaoEditar = document.createElement('button');
        let botaoApagar = document.createElement('button');
        let iEditar = document.createElement('i');
        let iApagar = document.createElement('i');
        console.log(membro)
        celEmail.innerHTML = membro.Email;
        celNome.innerHTML = membro.NomeCompleto;
        celTime.innerHTML = membro.Time;
        // celHoras.innerHTML = calculoHoras(membro.IdDiscord);
        if(membro.Cargo != "Administrador Primário"){
            botaoEditar.className = 'btn btn-sm btn-outline-light mx-auto';
            iEditar.className = 'bi bi-pencil';
            botaoApagar.className = 'btn btn-sm btn-outline-danger mx-auto';
            iApagar.className = 'bi bi-trash';
            botaoEditar.appendChild(iEditar);
            botaoApagar.appendChild(iApagar);
            celAcoes.appendChild(botaoEditar);
            celAcoes.appendChild(botaoApagar);
        } else {
            celCargo.innerHTML = "Administrador";
        }
    }
}

async function calculoHoras(idDiscord) {
    const treinosEndpoint = "/treinos";
    const urlCompletaTreinos = `${protocolo}${baseURL}${treinosEndpoint}`;
    let treinos = (await axios.get(urlCompletaTreinos)).data;

    let totalHoras = 0;

    treinos.forEach(treino => {
        const entradaJogador = treino.AttendedPlayers.filter(p => p.PlayerId === idDiscord);

        if(entradaJogador.length > 0){
            entradaJogador.forEach(entrada => {
                if(entrada.EntranceTimestamp > 0 && entrada.ExitTimestamp > 0){
                    let difMs = entrada.ExitTimestamp - entrada.EntranceTimestamp;
                    let difHoras = difMs / (1000 * 60 * 60); // o tempo é medido em milissegundos e precisa ser tranformado em horas
                    totalHoras += difHoras;    
                }    
            })    
        }
    });

    return totalHoras;
}

function exibeAlerta(seletor, innerHTML, classesToAdd, classesToRemove, timeout) {
    let alert = document.querySelector(seletor)
    alert.innerHTML = innerHTML
    alert.classList.add(...classesToAdd)
    alert.classList.remove(...classesToRemove)
    setTimeout(() => {
        alert.classList.remove(...classesToAdd)
        alert.classList.add(...classesToRemove)
    }, timeout)
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