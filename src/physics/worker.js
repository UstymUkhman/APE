self.postMessage({ foo: 'foo' });

self.addEventListener('message', (event) => {
  console.log('worker.js', event.data);
});
