/**
 * @description - lerp animation function
 * @param {number} from - start value of animation
 * @param {number} to - target value of animation
 * @param {number} delta - value between 0 and 1 of animation progress
 * @returns {number} current value of animation
 */
const lerp = (from, to, delta) => {
  return from + delta * (to - from);
};

export { lerp };
