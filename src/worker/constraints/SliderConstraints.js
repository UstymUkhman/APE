import Constraints from '@/super/Constraints';
import { Ammo } from '@/utils';

export default class SliderConstraints extends Constraints {
  constructor (world) {
    super(world, 'slider');
  }

  attachBody (props) {
    /* eslint-disable new-cap */
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(props.position.x, props.position.y, props.position.z));

    const rotation = transform.getRotation();
    rotation.setEulerZYX(props.axis.z, props.axis.y, props.axis.x);
    transform.setRotation(rotation);

    const slider = new Ammo.btSliderConstraint(
      props.body, transform, true
    );

    /* eslint-enable new-cap */
    Ammo.destroy(transform);
    this.add(slider);
  }

  attachBodies (props) {
    /* eslint-disable new-cap */
    const transform0 = new Ammo.btTransform();
    const transform1 = new Ammo.btTransform();

    transform0.setIdentity();
    transform1.setIdentity();

    transform0.setOrigin(new Ammo.btVector3(props.position0.x, props.position0.y, props.position0.z));
    let rotation = transform0.getRotation();

    rotation.setEulerZYX(props.axis.z, props.axis.y, props.axis.x);
    transform0.setRotation(rotation);

    transform1.setOrigin(new Ammo.btVector3(props.position1.x, props.position1.y, props.position1.z));
    rotation = transform1.getRotation();

    rotation.setEulerZYX(props.axis.z, props.axis.y, props.axis.x);
    transform1.setRotation(rotation);

    const slider = new Ammo.btSliderConstraint(
      props.body0, props.body1, transform0, transform1, true
    );

    /* eslint-enable new-cap */
    Ammo.destroy(transform0);
    Ammo.destroy(transform1);
    this.add(slider);
  }
}
