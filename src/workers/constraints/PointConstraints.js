import Constraint from '@/super/Constraint';
import { Ammo } from '@/utils';

export default class PointConstraints extends Constraint {
  constructor (world) {
    super(world, 'point');
  }

  attachBody (props) {
    /* eslint-disable new-cap */
    const point = new Ammo.btPoint2PointConstraint(
      props.body, new Ammo.btVector3(props.position.x, props.position.y, props.position.z)
    );

    /* eslint-enable new-cap */
    this.add(point);
  }

  attachBodies (props) {
    /* eslint-disable new-cap */
    const point = new Ammo.btPoint2PointConstraint(props.body0, props.body1,
      new Ammo.btVector3(props.position0.x, props.position0.y, props.position0.z),
      new Ammo.btVector3(props.position1.x, props.position1.y, props.position1.z)
    );

    /* eslint-enable new-cap */
    this.add(point);
  }
}
