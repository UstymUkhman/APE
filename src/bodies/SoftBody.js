import { ACTIVE_TAG, DISABLE_SIMULATION } from '@/constants';
import { Ammo, webWorker } from '@/utils';
import findIndex from 'lodash/findIndex';

export default class SoftBody {
  constructor (world) {
    this.bodies = [];
    this.world = world;
    this.worker = webWorker();

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  getBodyByUUID (uuid) {
    const index = findIndex(this.bodies, { uuid: uuid });
    return index > -1 ? this.bodies[index] : null;
  }

  activateAll () {
    for (let b = 0, length = this.bodies.length; b < length; b++) {
      const collider = this.bodies[b];

      this.world.removeSoftBody(collider.body);
      this.world.addSoftBody(collider.body, 1, -1);
      collider.body.activate();
    }
  }

  enable (mesh) {
    const index = findIndex(this.bodies, { uuid: mesh.uuid });

    if (index > -1) {
      const body = this.bodies[index].body;

      body.forceActivationState(ACTIVE_TAG);
      this.world.addSoftBody(body, 1, -1);

      this.updateBody(index);
      body.activate();
    }
  }

  disable (mesh) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeSoftBody(body.body);
    }
  }

  remove (mesh) {
    const index = findIndex(this.bodies, { uuid: mesh.uuid });

    if (index > -1) {
      const body = this.bodies[index];

      body.body.forceActivationState(DISABLE_SIMULATION);
      this.world.removeSoftBody(body.body);

      Ammo.destroy(body.body);
      delete body.geometry;

      this.bodies.splice(index, 1);
      return true;
    }

    return false;
  }
}
