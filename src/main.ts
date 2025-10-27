import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
scene.add(camera)

camera.position.set(8, 2.5, 8)
camera.lookAt(cameraPivot.position)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.enablePan = false
controls.minDistance = 15
controls.maxDistance = 140
controls.minPolarAngle = 0.2
controls.maxPolarAngle = Math.PI / 2 - 0.1

const syncControlsTarget = () => {
  controls.target.copy(cameraPivot.position)
}
syncControlsTarget()
controls.update()

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
const previousCameraPivot = new THREE.Vector3()

const baseCameraMoveSpeed = SETTINGS.camera.move.baseSpeed
const cameraBoostMultiplier = SETTINGS.camera.move.boostMultiplier

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
  const targetAmbient = (globalLightOn = on) ? 2.2 : 0
  const targetDirectional = on ? 3.0 : 0

  globalAmbient.intensity = targetAmbient
  globalDirectional.intensity = targetDirectional
}

setGlobalLight(globalLightOn)

buildingGroups.forEach(group => scene.add(group))

const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.85, metalness: 0.1 })
const fenceTempDirection = new THREE.Vector3()
const fenceMidpoint = new THREE.Vector3()
const fenceHeight = 4
const fenceThickness = 1
const minFenceDistance = 6
const maxFenceDistance = SETTINGS.city.spacing * 1.8
const desiredFenceCount = 18

const createFenceBetween = (groupA: THREE.Group, groupB: THREE.Group) => {
  fenceTempDirection.subVectors(groupB.position, groupA.position)
  const fenceLength = fenceTempDirection.length()
  if (fenceLength <= minFenceDistance)
    return false

  const fenceGeometry = new THREE.BoxGeometry(fenceLength, fenceHeight, fenceThickness)
  const fence = new THREE.Mesh(fenceGeometry, fenceMaterial)
  fence.castShadow = true
  fence.receiveShadow = true

  fenceMidpoint.addVectors(groupA.position, groupB.position).multiplyScalar(0.5)
  fence.position.set(fenceMidpoint.x, fenceHeight / 2, fenceMidpoint.z)
  fence.rotation.y = Math.atan2(fenceTempDirection.z, fenceTempDirection.x)

  scene.add(fence)
  fence.updateMatrixWorld(true)
  buildingBoxes.push(new THREE.Box3().setFromObject(fence))
  return true
}

if (buildingGroups.length >= 2) {
  const usedPairs = new Set<string>()
  let fencesCreated = 0
  const attempts = buildingGroups.length * 12

  for (let attempt = 0; attempt < attempts && fencesCreated < desiredFenceCount; attempt++) {
    const indexA = Math.floor(Math.random() * buildingGroups.length)
    let indexB = Math.floor(Math.random() * buildingGroups.length)

    if (buildingGroups.length === 1)
      break

    while (indexB === indexA)
      indexB = Math.floor(Math.random() * buildingGroups.length)

    const key = indexA < indexB ? `${indexA}-${indexB}` : `${indexB}-${indexA}`
    if (usedPairs.has(key))
      continue

    const groupA = buildingGroups[indexA]
    const groupB = buildingGroups[indexB]
    const distance = groupA.position.distanceTo(groupB.position)
    if (distance < minFenceDistance || distance > maxFenceDistance)
      continue

    if (createFenceBetween(groupA, groupB)) {
      usedPairs.add(key)
      fencesCreated++
    }
  }

  if (!usedPairs.size) {
    let bestA: THREE.Group | null = null
    let bestB: THREE.Group | null = null
    let bestDistance = Infinity

    for (let i = 0; i < buildingGroups.length - 1; i++) {
      for (let j = i + 1; j < buildingGroups.length; j++) {
        const distance = buildingGroups[i].position.distanceTo(buildingGroups[j].position)
        if (distance <= minFenceDistance)
          continue

        if (distance < bestDistance) {
          bestDistance = distance
          bestA = buildingGroups[i]
          bestB = buildingGroups[j]
        }
      }
    }

    if (bestA && bestB)
      createFenceBetween(bestA, bestB)
  }
}

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
      return
    case 's':
      controlsState.backward = value
      return
    case 'a':
      controlsState.left = value
      return
    case 'd':
      controlsState.right = value
      return
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

  previousCameraPivot.copy(cameraPivot.position)
  cameraPivot.position.add(cameraMoveVector)
  cameraPivot.position.y = THREE.MathUtils.clamp(
    cameraPivot.position.y,
    SETTINGS.camera.move.heightClamp.min,
    SETTINGS.camera.move.heightClamp.max
  )
  cameraMoveVector.copy(cameraPivot.position).sub(previousCameraPivot)
  camera.position.add(cameraMoveVector)
  syncControlsTarget()
}

const clock = new THREE.Clock()

const animate = () => {
  const delta = clock.getDelta()
  updateMovement(delta)
  updateCameraMovement(delta)
  controls.update()
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  controls.update()
})
