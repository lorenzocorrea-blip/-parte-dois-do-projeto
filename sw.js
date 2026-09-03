const CACHE_NAME = "clima-app-v1";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// Instala o Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ARQUIVOS);
            })
    );
});

// Busca os arquivos no cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((resposta) => {
                return resposta || fetch(event.request);
            })
    );
});