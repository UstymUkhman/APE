// Generic constants:
export const GRAVITY = -9.81;
export const ZERO_MASS = 0.0;
export const POWER16 = 0xFFFF;
export const HINGE_FORCE = 100;

// Rigid Body constants:
export const MARGIN = 0.01;
export const FRICTION = 0.5;
export const RESTITUTION = 0.0;
export const LINEAR_DAMPING = 0.0;
export const ANGULAR_DAMPING = 0.0;

// Soft Body constants:
export const SOFT_MARGIN = 0.02;
export const SOFT_DAMPING = 0.01;
export const SOFT_STIFFNESS = 1.0;
export const SOFT_PITERATIONS = 40;
export const SOFT_VITERATIONS = 40;

// Cloth Body constants:
export const CLOTH_MARGIN = 0.03;
export const CLOTH_PITERATIONS = 10;
export const CLOTH_VITERATIONS = 10;

// Rope Body constants:
export const ROPE_MARGIN = 0.05;
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

// Constraint constants:
export const CONSTRAINT_THRESHOLD = 0;

// Activation state constants:
export const ACTIVE_TAG = 1;
export const ISLAND_SLEEPING = 2;
export const WANTS_DEACTIVATION = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION = 5;

// Group constants:
export const DYNAMIC_GROUP = 1;
export const STATIC_GROUP = 2;
export const KINEMATIC_GROUP = 4;
// export const CLOTH_GROUP = ;
// export const SOFT_GROUP = ;

// Mask constants:
export const STATIC_MASK = 2;
export const NOT_STATIC_MASK = 65535 ^ 2;
export const NOT_STATIC_OR_KINEMATIC_MASK = 65535 ^ (2 | 4);
// export const DYNAMIC_MASK = ;
// export const CLOTH_MASK = ;
// export const SOFT_MASK = ;

// Collision constants:
export const STATIC_COLLISION = 1;
export const KINEMATIC_COLLISION = 2;
export const IGNORED_COLLISION = 4;
export const SOFT_COLLISION = 0x11;
export const CCD_MOTION_THRESHOLD = 1e-5;
