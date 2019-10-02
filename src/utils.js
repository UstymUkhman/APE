import AmmoJS from 'ammo.js';

import {
  GROUP_STATIC,
  GROUP_DEFAULT,
  GROUP_DYNAMIC,
  GROUP_KINEMATIC
} from '@/constants';

let Ammo = null;

// Ammo.js export wrapper:
AmmoJS().then(AmmoJS => { Ammo = AmmoJS; });

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
    case 'Static': return MASK_STATIC;
    case 'Dynamic': return MASK_DYNAMIC;
    case 'Kinematic': return MASK_KINEMATIC;
    default: return MASK_ALL;
  }
}; */

export {
  Ammo,
  webWorker,
  getBodyGroup
};
