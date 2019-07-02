import AmmoJS from 'ammo.js';

const DELTA = 0.000001;
let Ammo = null;

/**
 * @description - checks if 2 vertices from different buffers are equal
 * @param {Object} b1 - first vertices buffer
 * @param {number} x1 - x coord index in the first buffer
 * @param {Object} b2 - second vertices buffer
 * @param {number} x2 - x coord index in the second buffer
 * @returns {bool}
 */
const equalBufferVertices = (b1, x1, b2, x2) => {
  return Math.abs(b2[x2 + 2] - b1[x1 + 2]) < DELTA &&
         Math.abs(b2[x2 + 1] - b1[x1 + 1]) < DELTA &&
         Math.abs(b2[x2] - b1[x1]) < DELTA;
};

AmmoJS().then(AmmoJS => { Ammo = AmmoJS; });
export { Ammo, equalBufferVertices };
