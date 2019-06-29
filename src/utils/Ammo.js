// Ammo.js ES6 export wrapper

import AmmoJS from 'ammo.js';

let Ammo = null;
AmmoJS().then(AmmoJS => { Ammo = AmmoJS; });

export default Ammo;
