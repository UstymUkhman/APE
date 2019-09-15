import { Ammo, webWorker, getBodyGroup, getBodyMask } from '@/utils';
import find from 'lodash.find';

import {
  ACTIVE_TAG,
  SOFT_DAMPING,
  SOFT_FRICTION,
  SOFT_STIFFNESS,
  SOFT_COLLISION,
  DISABLE_SIMULATION
} from '@/constants';

export default class FlexBodies {
  constructor (world, type) {
    this.type = type;
    this.bodies = [];

    this.world = world;
    this.worker = webWorker();
    this.mask = getBodyMask(type);
    this.group = getBodyGroup(type);

    /* eslint-disable new-cap */
    this.helpers = new Ammo.btSoftBodyHelpers();
    /* eslint-enable new-cap */
  }

  setPiterations (mesh, piterations = this.piterations) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_piterations(mesh.piterations || piterations);
      body.body.activate();
    }
  }

  setViterations (mesh, viterations = this.viterations) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_viterations(mesh.viterations || viterations);
      body.body.activate();
    }
  }

  setCollisions (mesh, collisions = SOFT_COLLISION) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_collisions(mesh.collisions || collisions);
      body.body.activate();
    }
  }

  setStiffness (mesh, stiffness = SOFT_STIFFNESS) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const materials = body.body.get_m_materials().at(0);
      materials.set_m_kLST(mesh.stiffness || stiffness);
      materials.set_m_kAST(mesh.stiffness || stiffness);
      body.body.activate();
    }
  }

  setPressure (mesh, pressure = 0) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_kPR(mesh.pressure || pressure);
      body.body.activate();
    }
  }

  setFriction (mesh, friction = SOFT_FRICTION) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_kDF(mesh.friction || friction);
      body.body.activate();
    }
  }

  setDamping (mesh, damping = SOFT_DAMPING) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      const config = body.body.get_m_cfg();
      config.set_kDP(mesh.damping || damping);
      body.body.activate();
    }
  }

  setMargin (mesh, margin = this.margin) {
    const body = this.getBodyByUUID(mesh.uuid);

    if (body) {
      Ammo.castObject(body.body, Ammo.btCollisionObject).getCollisionShape().setMargin(mesh.margin || margin);
      body.body.activate();
    }
  }

  getBodyByUUID (uuid) {
    const body = find(this.bodies, { uuid: uuid });

    if (!body) {
      console.warn(
        `There\'s no \'${this.type}\' body with \'${uuid}\' UUID.`
      );
    }

    return body;
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
