let prevScrollPos = window.pageYOffset;
const navbar = document.getElementById("navbar");

if (navbar) {
    window.onscroll = function() {
        const currentScrollPos = window.pageYOffset;
        if (prevScrollPos > currentScrollPos) {
            navbar.style.top = "0";
        } else {
            navbar.style.top = "-70px";
        }
        prevScrollPos = currentScrollPos;
    };
}

function prepararNavBar(){
    const cargo = localStorage.getItem("cargo");
    if (localStorage.getItem("token") != null) {
        entrar.classList.add(['d-none']);
        const entrar = document.querySelector("#entrar-btn");
        const divAvt = document.querySelector("#avatar")
        const avatar = localStorage.getItem("avatar");
        divAvt.innerHTML = avatar;
        divAvt.classList.remove(['d-none']);
    }
    if(cargo?.includes("Administrador")){
        const painelAdm = document.querySelector("#painel-adm");
        painelAdm.classList.remove(["d-none"]);
    }if(cargo?.includes("Capitão")) {
        const painelCap = document.querySelector("#painel-cap")
        painelCap.classList.remove(["d-none"])
    }
}

document.addEventListener('DOMContentLoaded', function() {
    prepararNavBar();
});