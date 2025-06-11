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

function pegarNickname() {
    const nickname = (document.querySelector('#nicknameInput')).value;
    if(nickname) {
        const modelo = {
            Email: localStorage.getItem("email"),
            Nickname: nickname
        };
        return modelo;
    } else {
        exibeAlerta(".alert-nickname", `Você deve inserir um nickname!`, ['show', 'alert-danger'], ['d-none'], 4000);
    }
}

async function editarNickname() {
    try {
        const editarUsuarioEndpoint = "/editarUsuario";
        const urlCompletaUsuarios = `${protocolo}${baseURL}${editarUsuarioEndpoint}`;
        let modelo = pegarNickname();
        await axios.post(urlCompletaUsuarios, modelo);
        exibeAlerta(".alert-nickname", `Nickname alterado com sucesso!`, ['show', 'alert-success'], ['d-none'], 4000);
        setTimeout(() => {
            window.location.href = "pagina_jogador.html";
        }, 1000);
    }
    catch (error) {
        console.log(error);
    }
}

// adicionar usuários ao banco de dados
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
        await axios.post(urlCompletaUsuarios, modelo);
    }
    catch (error) {
        console.log(error);
    }
}

// Prepara a página de membros da área do administrador
async function prepararAbaMembros(idSeletor) {
    exibeTimes(idSeletor);
    const tabelaMembros = document.querySelector('#lista-membros');
    const corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    const todosMembros = await pegaMembros();
    let membrosFiltrados = [...todosMembros];
    const seletorCargo = document.querySelector("#filtro-cargos-select");
    const seletorTime = document.querySelector(idSeletor);

    async function aplicarFiltros() {
        const cargoSelecionado = seletorCargo.value;
        const timeSelecionado = seletorTime.value;
        membrosFiltrados = [...todosMembros];
        if (cargoSelecionado && cargoSelecionado !== "Todos") {
            membrosFiltrados = membrosFiltrados.filter(membro => membro.Cargo === cargoSelecionado);
        }
        if (timeSelecionado && timeSelecionado !== "Todos") {
            membrosFiltrados = membrosFiltrados.filter(membro => membro.Time === timeSelecionado);
        }
        corpoTabela.innerHTML = '';
        for (const membro of membrosFiltrados) {
            await exibeMembro(membro, corpoTabela);
        }
    }

    await aplicarFiltros();
    seletorCargo.addEventListener('change', aplicarFiltros);
    seletorTime.addEventListener('change', aplicarFiltros);
}

// Prepara a página de membros
async function prepararAbaMembrosCap(){
    let time = (buscarDadosUsuario()).Time;
    let tabelaMembros = document.querySelector('#lista-membros');
    let corpoTabela = tabelaMembros.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    let membros = await pegaMembros();
    membros = membros.filter(membro => membro.Time === time);
    for(let membro of membros) {
        await exibeMembro(membro, corpoTabela);
    }
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

    if (membro.Cargo.includes("Administrador")){
        celCargo.innerHTML = "Administrador";
    } else{
        celCargo.innerHTML = membro.Cargo;
    }

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
    return membros;
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

async function pegarModalidades() {
    const modalidadesEndpoint = "/modalidades";
    const urlCompleta = `${protocolo}${baseURL}${modalidadesEndpoint}`;
    const response = (await axios.get(urlCompleta)).data;
    modalidades = Object.values(response);
    return modalidades;
}

async function preprararAbaTreinos(){
    let modalidades = await pegarModalidades();
    modalidades.sort((a, b) => {
        if (a.Name > b.Name) return -1; // 'Z' vem antes de 'A'
        if (a.Name < b.Name) return 1;
        return 0;
    });
    const tabelaTreinos = document.querySelector('#lista-treinos');
    const corpoTabela = tabelaTreinos.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    for(let time of modalidades) {
        treinos = time.ScheduledTrainings.sort((a, b) => {
            const diaA = parseInt(a.Start.split(' ')[5]);
            const diaB = parseInt(b.Start.split(' ')[5]);
            return diaB - diaA;
        });
        for (let treino of treinos){
            exibeTreino(treino, time, corpoTabela)
        }
    }
}

async function carregarTreinosDaEquipe(){
    let time = (await buscarDadosUsuario()).Time;
    let modalidades = await pegarModalidades();
    console.log(modalidades)
    let modalidade = modalidades.filter(modalidade => modalidade.Name === time)[0];
    console.log(modalidade)
    const tabelaTreinos = document.querySelector('#lista-treinos');
    const corpoTabela = tabelaTreinos.getElementsByTagName('tbody')[0];
    corpoTabela.innerHTML = '';
    treinos = modalidade.ScheduledTrainings.sort((a, b) => {
        const diaA = parseInt(a.Start.split(' ')[5]);
        const diaB = parseInt(b.Start.split(' ')[5]);
        return diaB - diaA;
    });
    for (let treino of treinos){
        exibeTreino(treino, modalidade, corpoTabela)
    }
}

async function exibeTreino(treino, time, corpoTabela){
    const diasDaSemana = {
        0: "Domingo",
        1: "Segunda-feira",
        2: "Terça-feira",
        3: "Quarta-feira",
        4: "Quinta-feira",
        5: "Sexta-feira",
        6: "Sábado"
    };
    const [ , minInicio, horaInicio, , , diaSemana] = treino.Start.split(' ');
    const [minFim, horaFim] = treino.End.split(' ').slice(1, 3);
    let linha = corpoTabela.insertRow(0);
    linha.className = 'member-card';
    let celTime = linha.insertCell(0);
    let celDiaSem = linha.insertCell(1);
    let celHoraIni = linha.insertCell(2);
    let celHoraFim = linha.insertCell(3);
    let celAcoes = linha.insertCell(4);
    let botaoEditar = document.createElement('button');
    let botaoApagar = document.createElement('button');
    let iEditar = document.createElement('i');
    let iApagar = document.createElement('i');
    celTime.innerHTML = time.Name;
    celDiaSem.innerHTML = diasDaSemana[diaSemana];
    celHoraIni.innerHTML = `${horaInicio}:${minInicio}`;
    celHoraFim.innerHTML = `${horaFim}:${minFim}`;
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

}

checkStreamerStatus();
setInterval(checkStreamerStatus, 60000);