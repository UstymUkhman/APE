/* eslint-disable no-multi-spaces */

// Activation state constants:
export const ACTIVE_TAG                   = 1;
export const ISLAND_SLEEPING              = 2;
export const WANTS_DEACTIVATION           = 3;
export const DISABLE_DEACTIVATION         = 4;
export const DISABLE_SIMULATION           = 5;

// Generic constants:
export const ZERO_MASS                    =  0.0;
export const GRAVITY                      = -9.81;
export const POWER16                      = 0xFFFF;

// Rigid Body constants:
export const RIGID_MARGIN                 = 0.01;
export const RIGID_FRICTION               = 0.5;
export const RIGID_RESTITUTION            = 0.0;
export const RIGID_LINEAR_DAMPING         = 0.0;
export const RIGID_ANGULAR_DAMPING        = 0.0;

// Soft Body constants:
export const SOFT_FRICTION                = 0.5;
export const SOFT_MARGIN                  = 0.02;
export const SOFT_DAMPING                 = 0.01;
export const SOFT_STIFFNESS               = 1.0;
export const SOFT_PITERATIONS             = 40;
export const SOFT_VITERATIONS             = 40;
export const SOFT_RESTITUTION             = 0.0;

// Cloth Body constants:
export const CLOTH_MARGIN                 = 0.03;
export const CLOTH_PITERATIONS            = 10;
export const CLOTH_VITERATIONS            = 10;

// Rope Body constants:
export const ROPE_MARGIN                  = 0.05;
export const ROPE_PITERATIONS             = 10;
export const ROPE_VITERATIONS             = 10;

// Constraint constants:
export const GENERIC_VELOCITY             =  100;
export const GENERIC_MAX_FORCE            = 1000;
export const CONETWIST_IMPULSE            =  100;
export const HINGE_ACCELERATION           =  100;
export const SLIDER_ACCELERATION          =   50;
export const CONSTRAINT_THRESHOLD         =    0;

// Collision constants:
export const STATIC_COLLISION             =    1;
export const KINEMATIC_COLLISION          =    2;
export const IGNORED_COLLISION            =    4;
export const SOFT_COLLISION               = 0x11;
export const CCD_MOTION_THRESHOLD         = 1e-5;

// Group constants:
export const GROUP_NONE                   =     0;
export const GROUP_STATIC                 =     1;
export const GROUP_KINEMATIC              =     2;
export const GROUP_DYNAMIC                =     4;
export const GROUP_SOFT                   =     8;
export const GROUP_ROPE                   =    16;
export const GROUP_CLOTH                  =    32;
/*
export const GROUP_                       =    64;
export const GROUP_                       =   128;
export const GROUP_                       =   256;
export const GROUP_                       =   512;
export const GROUP_                       =  1024;
export const GROUP_                       =  2048;
export const GROUP_                       =  4096;
export const GROUP_                       =  8192;
export const GROUP_                       = 16384;
export const GROUP_                       = 32768;
*/

// Mask constants
// Gets specified body types:
export const MASK_SOFT                    = GROUP_SOFT;
export const MASK_CLOTH                   = GROUP_CLOTH;
export const MASK_STATIC                  = GROUP_STATIC;
export const MASK_DYNAMIC                 = GROUP_DYNAMIC;
export const MASK_KINEMATIC               = GROUP_KINEMATIC;
export const MASK_FLEX                    = GROUP_SOFT   | GROUP_CLOTH;
export const MASK_STATIC_AND_KINEMATIC    = GROUP_STATIC | GROUP_KINEMATIC;
export const MASK_RIGID                   = GROUP_STATIC | GROUP_KINEMATIC | GROUP_DYNAMIC;

// Gets all body types except:
export const MASK_NOT_SOFT                = POWER16 ^ GROUP_SOFT;
export const MASK_NOT_CLOTH               = POWER16 ^ GROUP_CLOTH;
export const MASK_NOT_STATIC              = POWER16 ^ GROUP_STATIC;
export const MASK_NOT_DYNAMIC             = POWER16 ^ GROUP_DYNAMIC;
export const MASK_NOT_KINEMATIC           = POWER16 ^ GROUP_KINEMATIC;
export const MASK_NOT_FLEX                = POWER16 ^ (GROUP_SOFT   | GROUP_CLOTH);
export const MASK_NOT_STATIC_OR_KINEMATIC = POWER16 ^ (GROUP_STATIC | GROUP_KINEMATIC);
export const MASK_NOT_RIGID               = POWER16 ^ (GROUP_STATIC | GROUP_KINEMATIC | GROUP_DYNAMIC);
/* eslint-enable no-multi-spaces */
