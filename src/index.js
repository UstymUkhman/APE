// import Vehicle from 'demos/Vehicle';
// import Soft from 'demos/Soft';

// import Worker from 'physics/worker.js';
import Worker from 'worker-loader!physics/worker.js';

export default class SWAGE {
  static createStage () {
    // return new Soft();

    const worker = new Worker();
    worker.postMessage({ a: 1 });

    worker.addEventListener('message', (event) => {
      console.log('index.js', event.data);
    });
  }
};
