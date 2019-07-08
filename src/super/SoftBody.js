import { ACTIVE_TAG, DISABLE_SIMULATION } from '@/constants';
import { Ammo, webWorker } from '@/utils';
import find from 'lodash.find';

export default class SoftBody {
  constructor (world) {
    this.bodies = [];
    this.world = world;
    this.worker = webWorker();

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  setPiterations (mesh, piterations = this.piterations) {
    const body = this.getBodyByUUID(mesh.uuid);
    piterations = mesh.piterations || piterations;

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_piterations(piterations);
      body.body.activate();
    }
  }

  setViterations (mesh, viterations = this.viterations) {
    const body = this.getBodyByUUID(mesh.uuid);
    viterations = mesh.viterations || viterations;

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_viterations(viterations);
      body.body.activate();
    }
  }

  getBodyByUUID (uuid) {
    return find(this.bodies, { uuid: uuid });
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
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const index = this.bodies.indexOf(body);

      body.body.forceActivationState(ACTIVE_TAG);
      this.world.addSoftBody(body.body, 1, -1);

      this.updateBody(index);
      body.body.activate();
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
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const index = this.bodies.indexOf(body);

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
