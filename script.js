// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const GEO_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const CLIMA_URL =
    "https://api.open-meteo.com/v1/forecast";


// ============================================
// ELEMENTOS
// ============================================

const botaoBuscar =
    document.getElementById("buscar");

const campoCidade =
    document.getElementById("cidade");

const resultado =
    document.getElementById("resultado");

const offlineAviso =
    document.getElementById("offlineAviso");


// ============================================
// INDICADOR DE INTERNET
// ============================================

function atualizarConexao() {

    if (!offlineAviso) {
        return;
    }

    if (navigator.onLine) {

        offlineAviso.style.display = "none";

    } else {

        offlineAviso.style.display = "block";

    }

}


// Verifica quando abre
atualizarConexao();


// Quando fica offline
window.addEventListener("offline", function () {

    atualizarConexao();

});


// Quando volta a internet
window.addEventListener("online", function () {

    atualizarConexao();

});


// ============================================
// BOTÃO
// ============================================

botaoBuscar.addEventListener(
    "click",
    buscarClima
);


// ============================================
// TECLA ENTER
// ============================================

campoCidade.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            buscarClima();

        }

    }
);


// ============================================
// BUSCAR CLIMA
// ============================================

function buscarClima() {

    const cidade =
        campoCidade.value.trim();


    // Campo vazio
    if (cidade === "") {

        resultado.innerHTML =
            "<p>Digite o nome de uma cidade.</p>";

        campoCidade.focus();

        return;

    }


    // Sem internet
    if (!navigator.onLine) {

        resultado.innerHTML =
            "<p>Você está sem conexão com a internet.</p>";

        return;

    }


    // Carregando
    resultado.innerHTML =
        "<p>Consultando o clima...</p>";


    // ============================================
    // BUSCAR CIDADE
    // ============================================

    const urlBusca =
        `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
        `&count=1&language=pt&format=json`;


    fetch(urlBusca)

        .then(function (resposta) {

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao consultar a cidade."
                );

            }

            return resposta.json();

        })


        // ========================================
        // DADOS DA CIDADE
        // ========================================

        .then(function (dadosCidade) {

            if (
                !dadosCidade.results ||
                dadosCidade.results.length === 0
            ) {

                throw new Error(
                    "Cidade não encontrada."
                );

            }


            const cidadeEncontrada =
                dadosCidade.results[0];


            const latitude =
                cidadeEncontrada.latitude;

            const longitude =
                cidadeEncontrada.longitude;

            const nome =
                cidadeEncontrada.name;


            // ====================================
            // BUSCAR CLIMA
            // ====================================

            const urlClima =
                `${CLIMA_URL}?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=temperature_2m,` +
                `relative_humidity_2m,` +
                `wind_speed_10m`;


            return fetch(urlClima)

                .then(function (resposta) {

                    if (!resposta.ok) {

                        throw new Error(
                            "Erro ao consultar o clima."
                        );

                    }

                    return resposta.json();

                })

                .then(function (dadosClima) {

                    return {

                        nome: nome,
                        clima: dadosClima

                    };

                });

        })


        // ========================================
        // MOSTRAR RESULTADO
        // ========================================

        .then(function (dados) {

            const nome =
                dados.nome;

            const clima =
                dados.clima;


            console.log(
                "JSON recebido:",
                clima
            );


            const temperatura =
                clima.current.temperature_2m;


            const umidade =
                clima.current.relative_humidity_2m;


            const vento =
                clima.current.wind_speed_10m;


            resultado.innerHTML = `

                <div class="card-clima">

                    <h2>${nome}</h2>

                    <p>
                        Temperatura:
                        <strong>
                            ${temperatura} °C
                        </strong>
                    </p>

                    <p>
                        Umidade:
                        <strong>
                            ${umidade}%
                        </strong>
                    </p>

                    <p>
                        Vento:
                        <strong>
                            ${vento} km/h
                        </strong>
                    </p>

                </div>

            `;

        })


        // ========================================
        // ERRO
        // ========================================

        .catch(function (erro) {

            console.error(erro);

            resultado.innerHTML = `

                <p>
                    Não foi possível consultar
                    o clima dessa cidade.
                </p>

            `;

        });

}


// ============================================
// SERVICE WORKER
// ============================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker

                .register("./sw.js")

                .then(function () {

                    console.log(
                        "Service Worker registrado com sucesso."
                    );

                })

                .catch(function (erro) {

                    console.error(
                        "Erro ao registrar o Service Worker:",
                        erro
                    );

                });

        }
    );

}