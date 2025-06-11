document.addEventListener('DOMContentLoaded', async function () {
    const divAvt = document.querySelector(".circle");
    const divNome = document.querySelector("#NomeUsuario");
    const divNickname = document.querySelector('#nicknameUsuario');
    const divEmail = document.querySelector('#emailUsuario');
    const divTime = document.querySelector("#Jogo");
    const divHoras = document.querySelector("#HPaes");

    divAvt.innerHTML = localStorage.getItem("avatar");
    const dados = await buscarDadosUsuario();
    divNome.innerHTML = `Nome: ${dados.NomeCompleto}`;
    divNickname.innerHTML = `Nickname: ${dados.Nickname}`;
    divEmail.innerHTML = `Email: ${dados.Email}`;
    
    if (dados.Time){
        divTime.innerHTML = dados.Time;
    } else {
        divTime.innerHTML = "Não está em nenhum time específico."
    }

    let horas = await calculoHoras(dados.IdDiscord);
    divHoras.innerHTML = horas || "Não há horas registradas";
    
    // Carregar os horários de treino
    carregarTreinosDaEquipe(false) 
})