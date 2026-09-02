
// 1. CONFIGURAÇÃO DA API (Open-Meteo — não exige chave)
// ============================================
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";

// ============================================
// 2. ELEMENTOS DA PÁGINA
// ============================================
const botaoBuscar = document.getElementById("buscar");
const campoCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");

// ============================================
// 3. LIGA O BOTÃO (E A TECLA ENTER) À FUNÇÃO
// ============================================
botaoBuscar.addEventListener("click", buscarClima);

campoCidade.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    buscarClima();
  }
});

// ============================================
// 4. FUNÇÃO PRINCIPAL
// ============================================
function buscarClima() {

  const cidade = campoCidade.value.trim();

  // Validação: não deixa consultar a API com campo vazio
  if (cidade === "") {
    resultado.innerHTML = "<p>Digite o nome de uma cidade.</p>";
    return;
  }

  resultado.innerHTML = "<p>Consultando o clima...</p>";

  // ----- Etapa 1: transforma o nome da cidade em coordenadas -----
  const urlBusca =
    `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
    `&count=1&language=pt&format=json`;

  fetch(urlBusca)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Não foi possível consultar a cidade.");
      }
      return resposta.json();
    })
    .then(dadosCidade => {

      // Se a API não encontrar nenhuma cidade com esse nome
      if (!dadosCidade.results || dadosCidade.results.length === 0) {
        throw new Error("Cidade não encontrada.");
      }

      const { latitude, longitude, name } = dadosCidade.results[0];

      // ----- Etapa 2: usa as coordenadas para buscar o clima -----
      const urlClima =
        `${CLIMA_URL}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

      return fetch(urlClima).then(resposta => {
        if (!resposta.ok) {
          throw new Error("Erro ao consultar o clima.");
        }
        return resposta.json();
      }).then(dadosClima => {
        // repassa o nome da cidade junto com os dados do clima
        return { nome: name, clima: dadosClima };
      });
    })
    .then(({ nome, clima }) => {

      console.log("JSON recebido:", clima);

      // ====================================
      // 5. EXTRAI OS DADOS DO JSON DO OPEN-METEO
      // ====================================
      const temperatura = clima.current.temperature_2m;
      const umidade = clima.current.relative_humidity_2m;
      const vento = clima.current.wind_speed_10m;

      // ====================================
      // 6. MOSTRA O RESULTADO NA TELA
      // ====================================
      resultado.innerHTML = `
        <div class="card-clima">
          <h2>${nome}</h2>

          <p>
            Temperatura:
            <strong>${temperatura} °C</strong>
          </p>

          <p>
            Umidade:
            <strong>${umidade}%</strong>
          </p>

          <p>
            Vento:
            <strong>${vento} km/h</strong>
          </p>
        </div>
      `;
    })
    .catch(erro => {
      console.error(erro);

      resultado.innerHTML = `
        <p>Não foi possível consultar o clima dessa cidade.</p>
      `;
    });
}
