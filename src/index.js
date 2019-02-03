// import Vehicle from 'demos/Vehicle';
// import Soft from 'demos/Soft';
import PlayGround from 'demos/PlayGround';

// import Worker from 'worker-loader!physics/worker.js';

export default class SWAGE {
  static createStage () {
    return new PlayGround();

    // console.log(1);

    // const worker = new Worker();
    // worker.postMessage({ a: 1 });

    // console.log(2);

    // worker.addEventListener('message', (event) => {
    //   console.log('index.js', event.data.foo);
    // });

    // console.log(3);
  }
};
