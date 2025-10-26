import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SETTINGS } from './config'
import { carGroup, setCarHeadlights } from './models/car'
import { buildingGroups, buildingBoxes } from './models/buildings'

const scene = new THREE.Scene()
scene.background = new THREE.Color(SETTINGS.world.fogColor)
scene.fog = new THREE.FogExp2(SETTINGS.world.fogColor, 0.022)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

const cameraPivot = new THREE.Object3D()
cameraPivot.position.set(0, 1, 0)
scene.add(cameraPivot)

const camera = new THREE.PerspectiveCamera(
  SETTINGS.camera.fov,
  window.innerWidth / window.innerHeight,
  SETTINGS.camera.clipping.near,
  SETTINGS.camera.clipping.far
)
cameraPivot.add(camera)

const spherical = new THREE.Spherical(
  SETTINGS.camera.spherical.radius,
  SETTINGS.camera.spherical.phi,
  SETTINGS.camera.spherical.theta
)
const updateCameraPosition = () => {
  const sinPhiRadius = Math.sin(spherical.phi) * spherical.radius
  camera.position.set(
    sinPhiRadius * Math.sin(spherical.theta),
    Math.cos(spherical.phi) * spherical.radius,
    sinPhiRadius * Math.cos(spherical.theta)
  )
  camera.lookAt(cameraPivot.position)
  camera.updateProjectionMatrix()
}
updateCameraPosition()

let isDragging = false
const lastPointer = new THREE.Vector2()
const cameraMoveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
  boost: false
}

const cameraMoveVector = new THREE.Vector3()
const cameraForwardVector = new THREE.Vector3()
const cameraStrafeVector = new THREE.Vector3()
const cameraWorldUp = new THREE.Vector3(0, 1, 0)

const baseCameraMoveSpeed = SETTINGS.camera.move.baseSpeed
const cameraBoostMultiplier = SETTINGS.camera.move.boostMultiplier

window.addEventListener('mousedown', (event) => {
  isDragging = true
  lastPointer.set(event.clientX, event.clientY)
})
window.addEventListener('mouseup', () => isDragging = false)
window.addEventListener('mouseleave', () => isDragging = false)
window.addEventListener('mousemove', (event) => {
  if (!isDragging)
    return

  const deltaX = event.clientX - lastPointer.x
  const deltaY = event.clientY - lastPointer.y
  lastPointer.set(event.clientX, event.clientY)
  spherical.theta -= deltaX * SETTINGS.camera.rotationSpeed
  spherical.phi = THREE.MathUtils.clamp(
    spherical.phi - deltaY * SETTINGS.camera.rotationSpeed,
    0.2,
    Math.PI / 2 - 0.1
  )
  updateCameraPosition()
})
window.addEventListener('wheel', (event) => {
  spherical.radius = THREE.MathUtils.clamp(
    spherical.radius + event.deltaY * SETTINGS.camera.zoomStep,
    15,
    140
  )
  updateCameraPosition()
})

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(SETTINGS.world.groundSize, SETTINGS.world.groundSize, 1, 1),
  new THREE.MeshStandardMaterial({ color: SETTINGS.world.groundColor, roughness: 0.96, metalness: 0.04 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

scene.add(carGroup)

let headlightsOn = true

const setHeadlights = (on: boolean) => {
  setCarHeadlights(on)
  headlightsOn = on
}

setHeadlights(headlightsOn)

const globalAmbient = new THREE.AmbientLight(0x6f7f9f, 0)
const globalDirectional = new THREE.DirectionalLight(0xbfd2ff, 0)
globalDirectional.position.set(30, 60, 10)
globalDirectional.castShadow = false
scene.add(globalAmbient)
scene.add(globalDirectional)

let globalLightOn = false

const setGlobalLight = (on: boolean) => {
  globalLightOn = on

  const targetAmbient = on ? 1.6 : 0
  const targetDirectional = on ? 2.4 : 0

  globalAmbient.intensity = targetAmbient
  globalDirectional.intensity = targetDirectional
}

setGlobalLight(globalLightOn)

buildingGroups.forEach((group: THREE.Group) => scene.add(group))

const controlsState = {
  forward: false,
  backward: false,
  left: false,
  right: false
}

const handleCameraMoveKey = (key: string, value: boolean) => {
  switch (key) {
    case 'arrowup':
    case 'i':
      cameraMoveState.forward = value
      return true
    case 'arrowdown':
    case 'k':
      cameraMoveState.backward = value
      return true
    case 'arrowleft':
    case 'j':
      cameraMoveState.left = value
      return true
    case 'arrowright':
    case 'l':
      cameraMoveState.right = value
      return true
    case 'u':
      cameraMoveState.up = value
      return true
    case 'o':
      cameraMoveState.down = value
      return true
    case 'shift':
      cameraMoveState.boost = value
      return true
    default:
      return false
  }
}

const handleMovementKey = (key: string, value: boolean) => {
  switch (key) {
    case 'w':
      controlsState.forward = value
      break;
    case 's':
      controlsState.backward = value
      break;
    case 'a':
      controlsState.left = value
      break;
    case 'd':
      controlsState.right = value
      break;
  }
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key))
    event.preventDefault()

  if (handleCameraMoveKey(key, true))
    return

  if (key === 'h') {
    setHeadlights(!headlightsOn)
    return
  }
  if (key === 'c') {
    cameraPivot.position.copy(carGroup.position)
    updateCameraPosition()
    return
  }
  if (key === 'g') {
    setGlobalLight(!globalLightOn)
    return
  }
  handleMovementKey(key, true)
})

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase()
  if (handleCameraMoveKey(key, false))
    return

  handleMovementKey(key, false)
})

const { vehicle: moveParams } = SETTINGS

const forwardVector = new THREE.Vector3()
const moveDelta = new THREE.Vector3()
const previousPosition = new THREE.Vector3()
const carBox = new THREE.Box3()

let moveSpeed = 0

const applyDrag = (delta: number) => {
  if (moveSpeed > 0)
    moveSpeed = Math.max(0, moveSpeed - moveParams.deceleration * delta)
  else if (moveSpeed < 0)
    moveSpeed = Math.min(0, moveSpeed + moveParams.deceleration * delta)
}

const updateMovement = (delta: number) => {
  if (controlsState.forward)
    moveSpeed += moveParams.acceleration * delta

  if (controlsState.backward)
    moveSpeed -= moveParams.acceleration * delta

  if (!controlsState.forward && !controlsState.backward)
    applyDrag(delta)

  moveSpeed = THREE.MathUtils.clamp(
    moveSpeed,
    -moveParams.maxReverseSpeed,
    moveParams.maxForwardSpeed
  )

  if (Math.abs(moveSpeed) < 0.01)
    moveSpeed = 0

  const turnDirection = moveSpeed !== 0 ? Math.sign(moveSpeed) : 1
  if (controlsState.left)
    carGroup.rotation.y += moveParams.turnSpeed * delta * turnDirection

  if (controlsState.right)
    carGroup.rotation.y -= moveParams.turnSpeed * delta * turnDirection

  forwardVector.set(1, 0, 0).applyQuaternion(carGroup.quaternion)
  moveDelta.copy(forwardVector).multiplyScalar(moveSpeed * delta)

  if (moveDelta.lengthSq() === 0)
    return

  previousPosition.copy(carGroup.position)
  carGroup.position.add(moveDelta)
  carGroup.position.y = 0
  carGroup.updateMatrixWorld(true)

  carBox.setFromObject(carGroup)

  let blocked = false
  if (
    carGroup.position.x > SETTINGS.world.bounds ||
    carGroup.position.x < -SETTINGS.world.bounds ||
    carGroup.position.z > SETTINGS.world.bounds ||
    carGroup.position.z < -SETTINGS.world.bounds
  ) {
    blocked = true
  }
  else {
    for (const box of buildingBoxes) {
      if (carBox.intersectsBox(box)) {
        blocked = true
        break
      }
    }
  }

  if (blocked) {
    carGroup.position.copy(previousPosition)
    carGroup.updateMatrixWorld(true)
    moveSpeed = 0
  }
}

const updateCameraMovement = (delta: number) => {
  const {
    forward,
    backward,
    left,
    right,
    up,
    down,
    boost
  } = cameraMoveState

  if (!forward && !backward && !left && !right && !up && !down)
    return

  cameraMoveVector.set(0, 0, 0)

  camera.getWorldDirection(cameraForwardVector)
  cameraForwardVector.y = 0
  if (cameraForwardVector.lengthSq() > 1e-6)
    cameraForwardVector.normalize()
  else
    cameraForwardVector.set(0, 0, -1)

  cameraStrafeVector.crossVectors(cameraForwardVector, cameraWorldUp)
  if (cameraStrafeVector.lengthSq() > 1e-6)
    cameraStrafeVector.normalize()
  else
    cameraStrafeVector.set(1, 0, 0)

  if (forward)
    cameraMoveVector.add(cameraForwardVector)
  if (backward)
    cameraMoveVector.addScaledVector(cameraForwardVector, -1)
  if (right)
    cameraMoveVector.add(cameraStrafeVector)
  if (left)
    cameraMoveVector.addScaledVector(cameraStrafeVector, -1)
  if (up)
    cameraMoveVector.add(cameraWorldUp)
  if (down)
    cameraMoveVector.addScaledVector(cameraWorldUp, -1)

  if (cameraMoveVector.lengthSq() === 0)
    return

  cameraMoveVector.normalize()
  const travelSpeed = (boost ? baseCameraMoveSpeed * cameraBoostMultiplier : baseCameraMoveSpeed) * delta
  cameraMoveVector.multiplyScalar(travelSpeed)
  cameraPivot.position.add(cameraMoveVector)
  cameraPivot.position.y = THREE.MathUtils.clamp(
    cameraPivot.position.y,
    SETTINGS.camera.move.heightClamp.min,
    SETTINGS.camera.move.heightClamp.max
  )

  updateCameraPosition()
}

const clock = new THREE.Clock()

const animate = () => {
  const delta = clock.getDelta()
  updateMovement(delta)
  updateCameraMovement(delta)
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  updateCameraPosition()
})
