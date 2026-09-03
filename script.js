// ============================================
// 1. CONFIGURAÇÃO DA API
// Open-Meteo — não exige chave
// ============================================

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";


// ============================================
// 2. ELEMENTOS DA PÁGINA
// ============================================

const botaoBuscar = document.getElementById("buscar");
const campoCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");
const offlineAviso = document.getElementById("offlineAviso");


// ============================================
// 3. INDICADOR DE CONEXÃO
// ============================================

function atualizarConexao() {

    if (navigator.onLine) {

        offlineAviso.style.display = "none";

    } else {

        offlineAviso.style.display = "block";

    }

}


// Verifica a conexão quando a página abre
atualizarConexao();


// Detecta quando o celular fica sem internet
window.addEventListener("offline", function () {

    atualizarConexao();

});


// Detecta quando a internet volta
window.addEventListener("online", function () {

    atualizarConexao();

});


// ============================================
// 4. LIGA O BOTÃO À FUNÇÃO
// ============================================

botaoBuscar.addEventListener("click", buscarClima);


// ============================================
// 5. PERMITE USAR A TECLA ENTER
// ============================================

campoCidade.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter") {

        buscarClima();

    }

});


// ============================================
// 6. FUNÇÃO PRINCIPAL
// ============================================

function buscarClima() {

    const cidade = campoCidade.value.trim();


    // Verifica se o campo está vazio
    if (cidade === "") {

        resultado.innerHTML =
            "<p>Digite o nome de uma cidade.</p>";

        return;

    }


    // Verifica se está sem internet
    if (!navigator.onLine) {

        resultado.innerHTML =
            "<p>Você está sem conexão com a internet.</p>";

        return;

    }


    // Mensagem enquanto consulta a API
    resultado.innerHTML =
        "<p>Consultando o clima...</p>";


    // ============================================
    // BUSCA A CIDADE
    // ============================================

    const urlBusca =
        `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
        `&count=1&language=pt&format=json`;


    fetch(urlBusca)

        .then(resposta => {

            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível consultar a cidade."
                );

            }

            return resposta.json();

        })


        // ============================================
        // RECEBE OS DADOS DA CIDADE
        // ============================================

        .then(dadosCidade => {

            // Se a cidade não for encontrada
            if (
                !dadosCidade.results ||
                dadosCidade.results.length === 0
            ) {

                throw new Error(
                    "Cidade não encontrada."
                );

            }


            // Pega latitude, longitude e nome
            const {
                latitude,
                longitude,
                name
            } = dadosCidade.results[0];


            // ============================================
            // BUSCA O CLIMA
            // ============================================

            const urlClima =
                `${CLIMA_URL}?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;


            return fetch(urlClima)

                .then(resposta => {

                    if (!resposta.ok) {

                        throw new Error(
                            "Erro ao consultar o clima."
                        );

                    }

                    return resposta.json();

                })


                .then(dadosClima => {

                    // Junta o nome da cidade
                    // com os dados do clima

                    return {

                        nome: name,

                        clima: dadosClima

                    };

                });

        })


        // ============================================
        // MOSTRA O CLIMA NA TELA
        // ============================================

        .then(({ nome, clima }) => {

            console.log(
                "JSON recebido:",
                clima
            );


            // Pega os dados atuais
            const temperatura =
                clima.current.temperature_2m;

            const umidade =
                clima.current.relative_humidity_2m;

            const vento =
                clima.current.wind_speed_10m;


            // ============================================
            // MOSTRA O RESULTADO
            // ============================================

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


        // ============================================
        // TRATAMENTO DE ERROS
        // ============================================

        .catch(erro => {

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
// 7. REGISTRO DO SERVICE WORKER
// ============================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker

            .register("sw.js")

            .then(() => {

                console.log(
                    "Service Worker registrado com sucesso."
                );

            })

            .catch((erro) => {

                console.error(
                    "Erro ao registrar o Service Worker:",
                    erro
                );

            });

    });

}