// Service Worker do Smart Zone (necessário para o app ser instalável)
const CACHE = 'smartzone-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e){
  // Estratégia "network first": tenta a internet, se falhar usa o cache.
  // Assim o conteúdo do site (vindo do Firebase) fica sempre atualizado.
  e.respondWith(
    fetch(e.request).then(function(resp){
      try{
        const copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }catch(err){}
      return resp;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
