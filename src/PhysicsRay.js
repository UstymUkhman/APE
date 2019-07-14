import { Ammo } from '@/utils';

export default class PhysicsRay {
  constructor (world) {
    this.world = world;

    /* eslint-disable new-cap */
    this.origin = new Ammo.btVector3();
    this.target = new Ammo.btVector3();
    this.closestResult = new Ammo.ClosestRayResultCallback(this.origin, this.target);
    /* eslint-enable new-cap */
  }

  cast (origin, target, hitPoint = null, hitNormal = null) {
    const rayCallBack = Ammo.castObject(this.closestResult, Ammo.RayResultCallback);
    rayCallBack.set_m_closestHitFraction(1);
    rayCallBack.set_m_collisionObject(null);

    this.origin.setValue(origin.x, origin.y, origin.z);
    this.target.setValue(target.x, target.y, target.z);

    this.closestResult.get_m_rayToWorld().setValue(target.x, target.y, target.z);
    this.closestResult.get_m_rayFromWorld().setValue(origin.x, origin.y, origin.z);

    this.world.rayTest(this.origin, this.target, this.closestResult);

    // console.log(this.closestResult.hasHit());

    if (this.closestResult.hasHit()) {
      if (hitPoint) {
        const point = this.closestResult.get_m_hitPointWorld();
        hitPoint.set(point.x(), point.y(), point.z());
      }

      if (hitNormal) {
        const normal = this.closestResult.get_m_hitNormalWorld();
        hitNormal.set(normal.x(), normal.y(), normal.z());
      }

      return true;
    }

    return false;
  }
}
