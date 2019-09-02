import { Vector3 } from 'three/src/math/Vector3';
import Constraint from '@/super/Constraint';
import { Ammo } from '@/utils';

export default class SliderConstraints extends Constraint {
  constructor (world, events) {
    super(world, 'slider');
    this.events = events;
  }

  addBody (bodyMesh, axis, position = new Vector3()) {
    this.events.emit('getSliderBody',
      bodyMesh.uuid, {
        position: position,
        axis: axis
      }
    );

    return this._uuid;
  }

  addBodies (body0, body1, axis, position0 = new Vector3(), position1 = new Vector3()) {
    this.events.emit('getSliderBodies',
      body0.uuid, body1.uuid, {
        positions: [position0, position1],
        axis: axis
      }
    );

    return this._uuid;
  }

  attachBody (body, pivot) {
    /* eslint-disable new-cap */
    const transform = new Ammo.btTransform();
    transform.setOrigin(new Ammo.btVector3(pivot.position.x, pivot.position.y, pivot.position.z));

    const rotation = transform.getRotation();
    // rotation.setEuler(pivot.axis.x, pivot.axis.y, pivot.axis.z);
    rotation.setEulerZYX(pivot.axis.z, pivot.axis.y, pivot.axis.x);
    transform.setRotation(rotation);

    const slider = new Ammo.btSliderConstraint(
      body, transform, true
    );

    /* eslint-enable new-cap */
    this.add(slider);
  }

  attachBodies (body0, body1, pivot) {
    /* eslint-disable new-cap */
    const transform0 = new Ammo.btTransform();
    const transform1 = new Ammo.btTransform();

    transform0.setOrigin(new Ammo.btVector3(pivot.positions[0].x, pivot.positions[0].y, pivot.positions[0].z));
    let rotation = transform0.getRotation();

    // rotation.setEuler(pivot.axis.x, pivot.axis.y, pivot.axis.z);
    rotation.setEulerZYX(pivot.axis.z, pivot.axis.y, pivot.axis.x);
    transform0.setRotation(rotation);

    transform1.setOrigin(new Ammo.btVector3(pivot.positions[1].x, pivot.positions[1].y, pivot.positions[1].z));
    rotation = transform1.getRotation();

    // rotation.setEuler(pivot.axis.x, pivot.axis.y, pivot.axis.z);
    rotation.setEulerZYX(pivot.axis.z, pivot.axis.y, pivot.axis.x);
    transform1.setRotation(rotation);

    const slider = new Ammo.btSliderConstraint(
      body0, body1, transform0, transform1, true
    );

    /* eslint-enable new-cap */
    this.add(slider);
  }
}
