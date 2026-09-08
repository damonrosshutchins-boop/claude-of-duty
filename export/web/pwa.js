// Installation is optional; unsupported browsers still run the game normally.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.warn('Offline caching is unavailable:', error.message);
  });
}
