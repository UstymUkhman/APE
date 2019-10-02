/* eslint-disable no-multi-spaces */

// Generic constants:
export const ZERO_MASS =  0.0;
export const GRAVITY   = -9.81;
export const POWER16   = 0xFFFF;

// Activation state constants:
export const ACTIVE_TAG           = 1;
export const ISLAND_SLEEPING      = 2;
export const WANTS_DEACTIVATION   = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION   = 5;

// Rigid Body constants:
export const RIGID_MARGIN          = 0.01;
export const RIGID_FRICTION        = 0.5;
export const RIGID_RESTITUTION     = 0.0;
export const RIGID_LINEAR_DAMPING  = 0.0;
export const RIGID_ANGULAR_DAMPING = 0.0;

// Collision constants:
export const STATIC_COLLISION     =    1;
export const KINEMATIC_COLLISION  =    2;
export const IGNORED_COLLISION    =    4;
export const CCD_MOTION_THRESHOLD = 1e-5;

// Group constants:
export const GROUP_NONE      =     0;
export const GROUP_DEFAULT   =     1;
export const GROUP_STATIC    =     2;
export const GROUP_KINEMATIC =     4;
export const GROUP_DYNAMIC   =   128;
export const GROUP_SOFT      =   256;
export const GROUP_CLOTH     =   512;
export const GROUP_ROPE      =  1024;

// Mask constants
export const MASK_ALL                     = POWER16;
export const MASK_SOFT                    = GROUP_SOFT;
export const MASK_ROPE                    = GROUP_ROPE;
export const MASK_CLOTH                   = GROUP_CLOTH;
export const MASK_STATIC                  = GROUP_STATIC;
export const MASK_DYNAMIC                 = GROUP_DYNAMIC;
export const MASK_KINEMATIC               = GROUP_KINEMATIC;
export const MASK_STATIC_AND_KINEMATIC    = GROUP_STATIC  | GROUP_KINEMATIC;
export const MASK_FLEX                    = GROUP_SOFT    | GROUP_CLOTH     | GROUP_ROPE;
export const MASK_RIGID                   = GROUP_STATIC  | GROUP_KINEMATIC | GROUP_DYNAMIC;

export const MASK_NOT_SOFT                = POWER16 ^ GROUP_SOFT;
export const MASK_NOT_CLOTH               = POWER16 ^ GROUP_CLOTH;
export const MASK_NOT_STATIC              = POWER16 ^ GROUP_STATIC;
export const MASK_NOT_DYNAMIC             = POWER16 ^ GROUP_DYNAMIC;
export const MASK_NOT_KINEMATIC           = POWER16 ^ GROUP_KINEMATIC;
export const MASK_NOT_STATIC_OR_KINEMATIC = POWER16 ^ MASK_STATIC_AND_KINEMATIC;
/* eslint-enable no-multi-spaces */
