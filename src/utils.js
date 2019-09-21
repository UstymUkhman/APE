import AmmoJS from 'ammo.js';

import {
  GROUP_SOFT,
  GROUP_ROPE,
  GROUP_CLOTH,
  GROUP_STATIC,
  GROUP_DEFAULT,
  GROUP_DYNAMIC,
  GROUP_KINEMATIC
} from '@/constants';

const DELTA = 0.000001;
let Ammo = null;

// Ammo.js export wrapper:
AmmoJS().then(AmmoJS => { Ammo = AmmoJS; });

/**
 * @description - checks if 2 vertices from different buffers are equal
 * @param {Object} b1 - first vertices buffer
 * @param {number} x1 - x coord index in the first buffer
 * @param {Object} b2 - second vertices buffer
 * @param {number} x2 - x coord index in the second buffer
 * @returns {boolean}
 */
const equalBufferVertices = (b1, x1, b2, x2) => {
  return Math.abs(b2[x2 + 2] - b1[x1 + 2]) < DELTA &&
         Math.abs(b2[x2 + 1] - b1[x1 + 1]) < DELTA &&
         Math.abs(b2[x2] - b1[x1]) < DELTA;
};

/**
 * @description - checks if the script is executing in a web worker
 * @returns {boolean}
 */
const webWorker = () => {
  return typeof WorkerGlobalScope !== 'undefined';
};

/**
 * @description - checks body type and returns its group constant
 * @param {String} type - body type
 * @returns {number}
 */
const getBodyGroup = (type) => {
  switch (type) {
    case 'Soft': return GROUP_SOFT;
    case 'Rope': return GROUP_ROPE;
    case 'Cloth': return GROUP_CLOTH;
    case 'Static': return GROUP_STATIC;
    case 'Dynamic': return GROUP_DYNAMIC;
    case 'Kinematic': return GROUP_KINEMATIC;
    default: return GROUP_DEFAULT;
  }
};

/**
 * @description - checks body type and returns its mask constant
 * @param {String} type - body type
 * @returns {number}
 */
/* const getBodyMask = (type) => {
  switch (type) {
    case 'Soft': return MASK_SOFT;
    case 'Rope': return MASK_ROPE;
    case 'Cloth': return MASK_CLOTH;
    case 'Static': return MASK_STATIC;
    case 'Dynamic': return MASK_DYNAMIC;
    case 'Kinematic': return MASK_KINEMATIC;
    default: return MASK_ALL;
  }
}; */

export {
  Ammo,
  webWorker,
  getBodyGroup,
  // getBodyMask,
  equalBufferVertices
};
