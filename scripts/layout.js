async function incluirHTML(id, arquivo) {
  try {
    const resposta = await fetch(arquivo);
    if (!resposta.ok) throw new Error(`Erro ao carregar ${arquivo}`);
    const conteudo = await resposta.text();
    document.getElementById(id).innerHTML = conteudo;

    if (id === "navbar-placeholder") {
      aplicarNavbarAtiva();
    }
  } catch (erro) {
    console.warn(`❌ Não foi possível carregar ${arquivo}:`, erro);
  }
}

function aplicarNavbarAtiva() {
  const path = window.location.pathname;
  const links = document.querySelectorAll("#navbar-placeholder .nav-link");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && path.endsWith(href)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  incluirHTML("navbar-placeholder", "components/navbar.html");
  incluirHTML("footer-placeholder", "components/footer.html");
});