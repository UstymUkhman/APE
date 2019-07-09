// Generic constants:
export const GRAVITY = -9.81;
export const ZERO_MASS = 0.0;
export const POWER16 = 0xFFFF;
export const HINGE_FORCE = 100;

// Rigid Body constants:
export const MARGIN = 0.04;
export const FRICTION = 0.5;
export const RESTITUTION = 0.0;
export const LINEAR_DAMPING = 0.0;
export const ANGULAR_DAMPING = 0.0;

// Soft Body constants:
export const SOFT_MARGIN = 0.05;
export const SOFT_DAMPING = 0.01;
export const SOFT_STIFFNESS = 1.0;
export const SOFT_PITERATIONS = 40;
export const SOFT_VITERATIONS = 40;

// Cloth Body constants:
export const CLOTH_MARGIN = 0.06;
export const CLOTH_PITERATIONS = 10;
export const CLOTH_VITERATIONS = 10;

// Rope Body constants:
export const ROPE_MARGIN = 0.1;
export const ROPE_PITERATIONS = 10;
export const ROPE_VITERATIONS = 10;

// Vehicle Body constants:
// export const BREAK_FORCE = 100.0;
// export const STEERING_STEP = 0.04;
// export const STEERING_CLAMP = 0.5;
// export const ENGINE_FORCE = 2000.0;

// export const ROLL_INFLUENCE = 0.2;
// export const SUSPENSION_REST = 0.6;
// export const FRICTION_SLIP = 1000.0;
// export const SUSPENSION_DAMPING = 2.3;
// export const SUSPENSION_STIFFNESS = 20.0;
// export const SUSPENSION_COMPRESSION = 4.4;

// Activation state constants:
export const ACTIVE_TAG = 1;
export const ISLAND_SLEEPING = 2;
export const WANTS_DEACTIVATION = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION = 5;

// Collision constants:
export const STATIC_COLLISION = 1;
export const KINEMATIC_COLLISION = 2;
export const IGNORED_COLLISION = 4;
export const SOFT_COLLISION = 0x11;
export const CCD_MOTION_THRESHOLD = 1e-5;
