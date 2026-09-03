const CACHE_NAME = "clima-app-v4";

const ARQUIVOS_PARA_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// ============================================
// INSTALAÇÃO
// ============================================

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function (cache) {

                return cache.addAll(ARQUIVOS_PARA_CACHE);

            })

    );

    self.skipWaiting();

});


// ============================================
// ATIVAÇÃO
// ============================================

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()

            .then(function (cachesExistentes) {

                return Promise.all(

                    cachesExistentes

                        .filter(function (cache) {

                            return cache !== CACHE_NAME;

                        })

                        .map(function (cache) {

                            return caches.delete(cache);

                        })

                );

            })

    );

    self.clients.claim();

});


// ============================================
// FUNCIONAMENTO OFFLINE
// ============================================

self.addEventListener("fetch", function (event) {

    event.respondWith(

        caches.match(event.request)

            .then(function (resposta) {

                if (resposta) {

                    return resposta;

                }

                return fetch(event.request);

            })

    );

});