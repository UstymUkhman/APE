import AmmoJS from 'ammo.js';

import {
  MASK_ALL,
  GROUP_DEFAULT,
  MASK_SOFT,
  GROUP_SOFT,
  MASK_ROPE,
  GROUP_ROPE,
  MASK_CLOTH,
  GROUP_CLOTH,
  MASK_STATIC,
  GROUP_STATIC,
  MASK_DYNAMIC,
  GROUP_DYNAMIC,
  MASK_KINEMATIC,
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
    case 'soft': return GROUP_SOFT;
    case 'rope': return GROUP_ROPE;
    case 'cloth': return GROUP_CLOTH;
    case 'static': return GROUP_STATIC;
    case 'dynamic': return GROUP_DYNAMIC;
    case 'kinematic': return GROUP_KINEMATIC;
    default: return GROUP_DEFAULT;
  }
};

/**
 * @description - checks body type and returns its mask constant
 * @param {String} type - body type
 * @returns {number}
 */
const getBodyMask = (type) => {
  return MASK_ALL;

  /* switch (type) {
    case 'soft': return MASK_SOFT;
    case 'rope': return MASK_ROPE;
    case 'cloth': return MASK_CLOTH;
    case 'static': return MASK_STATIC;
    case 'dynamic': return MASK_DYNAMIC;
    case 'kinematic': return MASK_KINEMATIC;
    default: return MASK_ALL;
  } */
};

export {
  Ammo,
  webWorker,
  getBodyMask,
  getBodyGroup,
  equalBufferVertices
};
