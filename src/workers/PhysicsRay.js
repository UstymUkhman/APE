import { Vector3 } from 'three/src/math/Vector3';

export default class PhysicsRay {
  constructor (worker) {
    this.hasHit = false;
    this.worker = worker;

    this.point = new Vector3();
    this.normal = new Vector3();
    this.worker.postMessage({action: 'initPhysicsRay'});
  }

  cast (origin, target, hitPoint = null, hitNormal = null) {
    this.worker.postMessage({
      action: 'castRay',
      params: {
        hitNormal: hitNormal,
        hitPoint: hitPoint,
        origin: origin,
        target: target
      }
    });

    if (hitNormal) {
      hitNormal.set(this.normal.x, this.normal.y, this.normal.z);
    }

    if (hitPoint) {
      hitPoint.set(this.point.x, this.point.y, this.point.z);
    }

    return this.hasHit;
  }

  setClosestHitFraction (hitFraction = 1) {
    this.worker.postMessage({
      action: 'setClosestHitFraction',
      params: {
        hitFraction: hitFraction
      }
    });
  }

  setCollisionFilterGroup (filterGroup) {
    this.worker.postMessage({
      action: 'setCollisionFilterGroup',
      params: {
        filterGroup: filterGroup
      }
    });
  }

  setCollisionFilterMask (filterMask) {
    this.worker.postMessage({
      action: 'setCollisionFilterMask',
      params: {
        filterMask: filterMask
      }
    });
  }

  setResult (result) {
    if (result.normal) {
      this.normal.set(result.normal.x, result.normal.y, result.normal.z);
    }

    if (result.point) {
      this.point.set(result.point.x, result.point.y, result.point.z);
    }

    this.hasHit = result.hasHit;
  }
}
