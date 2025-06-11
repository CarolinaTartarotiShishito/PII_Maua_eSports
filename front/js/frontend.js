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
        localStorage.setItem("email", loginResponse.account.username)
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

// Função para exiber os times nos seletores
async function exibeTimes(idSeletor){
    const seletor = document.querySelector(idSeletor);
    const modalidadesEndpoint = '/modalidades';
    const urlCompleta = `${protocolo}${baseURL}${modalidadesEndpoint}`;
    const response = (await axios.get(urlCompleta)).data;
    let times = Object.values(response);
    for(let time of times){
        const opcao = document.createElement('option');
        opcao.innerHTML = time.Name;
        opcao.value = time.Name;
        seletor.appendChild(opcao);
    };

    if(idSeletor === "#filtro-times-select") {
        seletor.addEventListener('change', async (event) => {
            if(event.target.value == "Todos") {
                await atualizarMembros();
            }
            else if (event.target.value){
                filtrarMembros("Time", event.target.value);
            }
        });
    };
}

function pegarInfosModal(){
    const email = (document.querySelector('#emailUsuario')).value;
    const nome = (document.querySelector('#nomeUsuario')).value;
    const nickname = (document.querySelector('#nicknameUsuario')).value;
    const idDiscord = (document.querySelector('#idUsuario')).value;
    const cargo = (document.querySelector('#cargoUsuarioSelect')).value;
    const time = (document.querySelector('#timesUsuarioSelect')).value;
    if (email && nome && nickname && idDiscord && cargo) {
        if(email.includes('@maua.br')){
            const modelo = {
                Email: email,
                NomeCompleto: nome,
                Nickname: nickname,
                IdDiscord: idDiscord,
                Cargo: cargo,
                Time: time // Time é opicional, caso não seja seleciondo, armazenará uma String vazia
            };
            return modelo;
        } else{
            exibeAlerta(".alert-membros", `O e-mail deve pertencer ao domínio do Instituto Mauá de Tecnologia ("@maua.br)!`, 
                ['show', 'alert-danger'], ['d-none'], 4000);
        }
    } else {
        exibeAlerta(".alert-membros", "Preencha todos os campos obrigatórios!", 
                ['show', 'alert-danger'], ['d-none'], 4000);
    }
}

// adicionaar usuários ao banco de dados
async function novoUsuario() {
    try {
        const novoUsuarioEndpoint = "/usuarios";
        const urlCompletaUsuarios = `${protocolo}${baseURL}${novoUsuarioEndpoint}`;
        let modelo = pegarInfosModal();
        await axios.post(urlCompletaUsuarios, modelo)
        exibeAlerta(".alert-membros", "Usuário adicionado com sucesso!", ['show', 'alert-success'], ['d-none'], 4000);
    }
    catch (error) {
        console.log(error);
    }
}

async function apagarUsuario(nome, email) {
    try {
        if (!confirm(`Tem certeza que deseja deletar o usuário ${nome}?`)) {
            return;
        }
        const deletaUsuarioEndpoint = "/deletaUsuarios";
        const urlCompletaDeletar = `${protocolo}${baseURL}${deletaUsuarioEndpoint}`;
        await axios.post(urlCompletaDeletar, { Email: email });
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
    }
}

async function editarUsuario() {
    try {
        const editarUsuarioEndpoint = "/editarUsuario";
        const urlCompletaUsuarios = `${protocolo}${baseURL}${editarUsuarioEndpoint}`;
        let modelo = pegarInfosModal();
        await axios.post(urlCompletaUsuarios, modelo)
    }
    catch (error) {
        console.log(error);
    }
}

// Prepara a página de membros
async function prepararAbaMembros(idSeletor){
    exibeTimes(idSeletor);
    let tabelaMembros = document.querySelector('#lista-membros');
    let corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    let membros = await pegaMembros();
    for(let membro of membros) {
        await exibeMembro(membro, corpoTabela);
    }
    
    const seletorCargo = document.querySelector("#filtro-cargos-select");
    seletorCargo.addEventListener('change', async (event) => {
        const valorSelecionado = event.target.value;
        if (!valorSelecionado) return;
        if (valorSelecionado === "Todos") {
            await atualizarMembros();
        } else {
            await filtrarMembros("Cargo", valorSelecionado);
        }
    });
}

async function pegaMembros(){
    const membrosEndpoint = "/usuarios";
    const urlCompletaMembros = `${protocolo}${baseURL}${membrosEndpoint}`;
    const response = (await axios.get(urlCompletaMembros))
    return response.data;
}

// função para exibir um membro na aba_membros.html
async function exibeMembro(membro, corpoTabela){
    let linha = corpoTabela.insertRow(0);
    linha.className = 'member-card';
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
    celEmail.innerHTML = membro.Email;
    celNome.innerHTML = membro.NomeCompleto;
    celTime.innerHTML = membro.Time;
    let horas = await calculoHoras(membro.IdDiscord);
    celHoras.innerHTML = horas || "";
    if(membro.Cargo != "Administrador Primário"){
        botaoEditar.className = 'btn btn-sm btn-outline-light mx-auto';
        iEditar.className = 'bi bi-pencil';
        botaoEditar.setAttribute('data-bs-toggle', 'modal')
        botaoEditar.setAttribute('data-bs-target', `#modalMembro`)
        botaoEditar.onclick = () => modalEditarMembro(membro);
        botaoApagar.className = 'btn btn-sm btn-outline-danger mx-auto';
        botaoApagar.onclick = async () => {
            await apagarUsuario(membro.NomeCompleto, membro.Email);
            await atualizarMembros();
        };
        iApagar.className = 'bi bi-trash';
        botaoEditar.appendChild(iEditar);
        botaoApagar.appendChild(iApagar);
        celAcoes.appendChild(botaoEditar);
        celAcoes.appendChild(botaoApagar);
        celCargo.innerHTML = membro.Cargo;
    } else {
        celCargo.innerHTML = "Administrador";
    }
}

async function filtrarMembros(tipo, filtro){
    const buscaEndpoint = '/buscaEspecificaUsuario';
    const urlCompleta = `${protocolo}${baseURL}${buscaEndpoint}`;
    let tabelaMembros = document.querySelector('#lista-membros');
    let corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0]
    corpoTabela.innerHTML = '';
    let membros = (await axios.get(urlCompleta, { params: { Tipo: tipo, Filtro: filtro } })).data;
    for(let membro of membros) {
        await exibeMembro(membro, corpoTabela);
    }
}

async function atualizarMembros() {
    let tabelaMembros = document.querySelector('#lista-membros');
    let corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    let membros = await pegaMembros();
    for(let membro of membros) {
        await exibeMembro(membro, corpoTabela);
    }
}

function modalAdicionarMembro(){
    limparModalMembro();
    const divTitulo = document.querySelector('#modalMembroLabel')
    const btnSalvar = document.querySelector('#salvarMembro');
    divTitulo.innerHTML = "Adicionar Membro";
    btnSalvar.onclick = async () => {
        await novoUsuario();
        await atualizarMembros();
    };
}

function modalEditarMembro(membro) {
    const divTitulo = document.querySelector('#modalMembroLabel');
    const emailCampo = document.querySelector('#emailUsuario');
    const nomeCampo = document.querySelector('#nomeUsuario');
    const nicknameCampo = document.querySelector('#nicknameUsuario');
    const idDiscordCampo = document.querySelector('#idUsuario');
    const cargoCampo = document.querySelector('#cargoUsuarioSelect');
    const timeCampo = document.querySelector('#timesUsuarioSelect');
    const btnSalvar = document.querySelector('#salvarMembro');
    divTitulo.innerHTML = "Editar informações"
    emailCampo.value = membro.Email;
    nomeCampo.value = membro.NomeCompleto;
    nicknameCampo.value = membro.Nickname;
    idDiscordCampo.value = membro.IdDiscord;
    cargoCampo.value = membro.Cargo;
    timeCampo.value = membro.Time;
    btnSalvar.onclick = async () => {
        await editarUsuario();
        await atualizarMembros();
    };
}

function limparModalMembro(){
    const emailCampo = document.querySelector('#emailUsuario');
    const nomeCampo = document.querySelector('#nomeUsuario');
    const nicknameCampo = document.querySelector('#nicknameUsuario');
    const idDiscordCampo = document.querySelector('#idUsuario');
    const cargoCampo = document.querySelector('#cargoUsuarioSelect');
    const timeCampo = document.querySelector('#timesUsuarioSelect');
    emailCampo.value = '';
    nomeCampo.value = '';
    nicknameCampo.value = '';
    idDiscordCampo.value = '';
    cargoCampo.value = '';
    timeCampo.value = '';
}

async function calculoHoras(idDiscord) {
    try {
        const treinosEndpoint = "/treinos";
        const urlCompletaTreinos = `${protocolo}${baseURL}${treinosEndpoint}`;
        let treinos = (await axios.get(urlCompletaTreinos)).data;
        let totalHoras = 0;
        let usuarioEncontrado = false;

        treinos.forEach(treino => {
            const entradaJogador = treino.AttendedPlayers.filter(p => p.PlayerId === idDiscord);

            if(entradaJogador.length > 0){
                usuarioEncontrado = true;
                entradaJogador.forEach(entrada => {
                    if(entrada.EntranceTimestamp > 0 && entrada.ExitTimestamp > 0){
                        let difMs = entrada.ExitTimestamp - entrada.EntranceTimestamp;
                        let difHoras = difMs / (1000 * 60 * 60);
                        totalHoras += difHoras;    
                    }    
                });    
            };
        });
        if (!usuarioEncontrado) {
            return 0;
        };
        return totalHoras;    
    }
    catch (error) {
        console.log("Não foi possível obter a quantidade de horas do usuário");
    }
}

async function buscarDadosUsuario(){
    const email = localStorage.getItem("email");
    const dadosEndpoint = "/dadosUsuario";
    const urlCompletaDados = `${protocolo}${baseURL}${dadosEndpoint}`;
    const response = (await axios.get(urlCompletaDados, { params: { email: email } })).data;
    console.log(response);
    return response;
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

function logout(){
    localStorage.clear();
    window.location.href = "index.html";
}

checkStreamerStatus();
setInterval(checkStreamerStatus, 60000);