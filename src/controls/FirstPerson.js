// FirstPerson Mode Controls

// Based on three.js PointerLockControls:
// https://threejs.org/examples/js/controls/PointerLockControls.js

// import { Object3D } from '@three/core/Object3D'
// import { Vector3 } from '@three/math/Vector3'
// import { Euler } from '@three/math/Euler'

// export default class FirstPerson {
//   constructor (camera, height = 10) {
//     this.rotation = new Euler(0, 0, 0, 'YXZ')
//     this.direction = new Vector3(0, 0, -1)
//     this.pitchObject = new Object3D()
//     this.yawObject = new Object3D()

//     this.PI_2 = Math.PI / 2
//     this.enabled = false

//     this.pitchObject.add(camera)
//     this.yawObject.position.y = height
//     this.yawObject.add(this.pitchObject)

//     this._onMouseMove = this.onMouseMove.bind(this)
//     document.addEventListener('mousemove', this._onMouseMove, false)
//   }

//   onMouseMove (event) {
//     if (!this.enabled) return

//     const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
//     const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

//     this.yawObject.rotation.y -= movementX * 0.002
//     this.pitchObject.rotation.x -= movementY * 0.002
//     this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x))

//     if (this.pitchObject.rotation.x < -0.5) {
//       this.pitchObject.rotation.x = -0.5
//     }
//   }

//   getDirection (way) {
//     this.rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0)
//     way.copy(this.direction).applyEuler(this.rotation)
//     return way
//   }

//   getObject () {
//     return this.yawObject
//   }

//   dispose () {
//     document.removeEventListener('mousemove', this._onMouseMove, false)
//     this.enabled = false
//   }
// }
