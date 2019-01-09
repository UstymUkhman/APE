// Ammo.js ES6 export wrapper

import AmmoJS from 'Ammo.js';

let Ammo = null;
AmmoJS().then(AmmoJS => Ammo = AmmoJS);

export { Ammo };
