import { Quaternion } from 'three/src/math/Quaternion';
import { Vector3 } from 'three/src/math/Vector3';

// Generic constants:
export const GRAVITY = -9.81;

// Collision constants:
export const STATIC_COLLISION = 1;
export const KINEMATIC_COLLISION = 2;
export const IGNORED_COLLISION = 4;

// Activation state constants:
export const ACTIVE_TAG = 1;
export const ISLAND_SLEEPING = 2;
export const WANTS_DEACTIVATION = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION = 5;

// Common THREE.js constants:
export const ZERO_VECTOR3 = new Vector3(0.0, 0.0, 0.0);
export const ZERO_QUATERNION = new Quaternion(0.0, 0.0, 0.0, 1.0);
