const CACHE_NAME = "clima-app-v1";

const ARQUIVOS_PARA_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// ============================================
// INSTALAÇÃO DO SERVICE WORKER
// ============================================

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ARQUIVOS_PARA_CACHE);
            })
    );

    self.skipWaiting();
});

// ============================================
// ATIVAÇÃO
// ============================================

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cachesExistentes) => {
                return Promise.all(
                    cachesExistentes
                        .filter((cache) => cache !== CACHE_NAME)
                        .map((cache) => caches.delete(cache))
                );
            })
    );

    self.clients.claim();
});

// ============================================
// FUNCIONAMENTO OFFLINE
// ============================================

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((resposta) => {
                return resposta || fetch(event.request);
            })
    );
});