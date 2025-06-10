document.addEventListener('DOMContentLoaded', async function () {
    const divAvt = document.querySelector(".circle");
    const divNome = document.querySelector("#NomeUsuario");
    const divTime = document.querySelector("#Jogo");
    const divHoras = document.querySelector("#HPaes");

    divAvt.innerHTML = localStorage.getItem("avatar");
    const dados = await buscarDadosUsuario();
    divNome.innerHTML = `Nome: ${dados.NomeCompleto}`;
    if (dados.time){
        divTime.innerHTML = dados.time;
    } else {
        divTime.innerHTML = "Não está em nenhum time específico."
    }

    let horas = await calculoHoras(dados.IdDiscord);
    divHoras.innerHTML = horas || "Não há horas registradas";
    
})