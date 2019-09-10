import Constraints from '@/constraints/Constraints';
import { Vector3 } from 'three/src/math/Vector3';
import { Ammo } from '@/utils';

export default class PointConstraints extends Constraints {
  constructor (world, events) {
    super(world, 'point');
    this.events = events;
  }

  addBody (bodyMesh, position = new Vector3()) {
    this.events.emit('getPointBody',
      bodyMesh.uuid, position
    );

    return this._uuid;
  }

  addBodies (body0, body1, position0 = new Vector3(), position1 = new Vector3()) {
    this.events.emit('getPointBodies',
      body0.uuid, body1.uuid, [
        position0, position1
      ]
    );

    return this._uuid;
  }

  attachBody (body, position) {
    /* eslint-disable new-cap */
    const point = new Ammo.btPoint2PointConstraint(
      body, new Ammo.btVector3(position.x, position.y, position.z)
    );

    /* eslint-enable new-cap */
    this.add(point);
  }

  attachBodies (body0, body1, positions) {
    /* eslint-disable new-cap */
    const point = new Ammo.btPoint2PointConstraint(body0, body1,
      new Ammo.btVector3(positions[0].x, positions[0].y, positions[0].z),
      new Ammo.btVector3(positions[1].x, positions[1].y, positions[1].z)
    );

    /* eslint-enable new-cap */
    this.add(point);
  }
}
