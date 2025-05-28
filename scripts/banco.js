// scripts/banco.js

// URL da API (ajuste se necessário)
const API_URL = "http://localhost:3000/teams";

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("lista-times");

  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error("Erro na resposta da API.");
      return res.json();
    })
    .then(times => {
      lista.innerHTML = "";

      if (times.length === 0) {
        lista.innerHTML = "<li>Nenhum time encontrado.</li>";
        return;
      }

      times.forEach(time => {
        const li = document.createElement("li");
        li.textContent = time.name || "Nome não disponível";
        lista.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar dados:", err);
      lista.innerHTML = `<li>Erro ao carregar dados: ${err.message}</li>`;
    });
});
