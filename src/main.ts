import * as THREE from 'three'
import { createAsphaltTexture } from './scene/textures'
import { createRoadNetwork, createSidewalkRings } from './scene/infrastructure'
import { createBuildingTextures, buildBuildingGroup } from './scene/buildings'
import type { BuildingConfig, RoofStyle } from './types'

const createCityLayout = () => {
  const configs: BuildingConfig[] = []
  const gridRadius = 5
  const blockSpacing = 40
  const innerSafeRadius = 1

  for (let gx = -gridRadius; gx <= gridRadius; gx++) {
    for (let gz = -gridRadius; gz <= gridRadius; gz++) {
      if (Math.abs(gx) <= innerSafeRadius && Math.abs(gz) <= innerSafeRadius) continue

      const anchorX = gx * blockSpacing
      const anchorZ = gz * blockSpacing
      const buildingCount = THREE.MathUtils.randInt(2, 4)

      for (let i = 0; i < buildingCount; i++) {
        const width = THREE.MathUtils.randFloat(10, 22)
        const depth = THREE.MathUtils.randFloat(10, 22)
        const floors = THREE.MathUtils.randInt(4, 12)
        const height = floors * THREE.MathUtils.randFloat(3, 3.8)
        const offsetX = THREE.MathUtils.randFloatSpread(blockSpacing * 0.6)
        const offsetZ = THREE.MathUtils.randFloatSpread(blockSpacing * 0.6)

        const roofRoll: RoofStyle[] = ['flat', 'angled', 'helipad']
        const roofStyle = roofRoll[Math.floor(Math.random() * roofRoll.length)]

        configs.push({
          x: anchorX + offsetX,
          z: anchorZ + offsetZ,
          width,
          depth,
          floors,
          height,
          roofStyle
        })
      }
    }
  }

  return configs
}

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)
scene.fog = new THREE.FogExp2(0x000000, 0.022)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

const cameraPivot = new THREE.Object3D()
cameraPivot.position.set(0, 1, 0)
scene.add(cameraPivot)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800)
cameraPivot.add(camera)

const spherical = new THREE.Spherical(55, Math.PI / 3.4, Math.PI / 4)
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
const baseCameraMoveSpeed = 28
const cameraBoostMultiplier = 2.2

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
  spherical.theta -= deltaX * 0.005
  spherical.phi = THREE.MathUtils.clamp(spherical.phi - deltaY * 0.005, 0.2, Math.PI / 2 - 0.1)
  updateCameraPosition()
})
window.addEventListener('wheel', (event) => {
  spherical.radius = THREE.MathUtils.clamp(spherical.radius + event.deltaY * 0.01, 15, 140)
  updateCameraPosition()
})

const groundTexture = new THREE.CanvasTexture(createAsphaltTexture())
groundTexture.wrapS = THREE.RepeatWrapping
groundTexture.wrapT = THREE.RepeatWrapping
groundTexture.repeat.set(70, 70)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500, 1, 1),
  new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 0.95, metalness: 0 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const carGroup = new THREE.Group()
scene.add(carGroup)

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x2d5bff,
  metalness: 0.5,
  roughness: 0.25,
  emissive: new THREE.Color(0x11244f),
  emissiveIntensity: 0.6
})
const trimMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  metalness: 0.3,
  roughness: 0.7,
  emissive: new THREE.Color(0x080808),
  emissiveIntensity: 0.55
})
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x8fbaff,
  transmission: 0.6,
  roughness: 0.05,
  thickness: 0.2,
  emissive: new THREE.Color(0x335d82),
  emissiveIntensity: 0.4
})

const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.6, 2.4), trimMaterial)
chassis.castShadow = true
chassis.position.y = 0.6
carGroup.add(chassis)

const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 2.2), bodyMaterial)
body.castShadow = true
body.position.y = 1.2
carGroup.add(body)

const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1, 1.9), bodyMaterial)
cabin.castShadow = true
cabin.position.set(-0.2, 1.9, 0)
carGroup.add(cabin)

const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.8), glassMaterial)
windshield.position.set(1, 1.95, 0)
carGroup.add(windshield)

const sideWindows = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.6), glassMaterial)
sideWindows.position.set(-0.4, 1.95, 0)
carGroup.add(sideWindows)

const hood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 2.1), bodyMaterial)
hood.castShadow = true
hood.position.set(2, 1.05, 0)
carGroup.add(hood)

const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 2.1), trimMaterial)
spoiler.castShadow = true
spoiler.position.set(-2.2, 1.6, 0)
carGroup.add(spoiler)

const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.2), trimMaterial)
frontBumper.castShadow = true
frontBumper.position.set(2.6, 0.85, 0)
carGroup.add(frontBumper)

const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.2), trimMaterial)
rearBumper.castShadow = true
rearBumper.position.set(-2.6, 0.85, 0)
carGroup.add(rearBumper)

const grill = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.4, 1.4),
  new THREE.MeshStandardMaterial({ color: 0x202020, metalness: 0.8, roughness: 0.2 })
)
grill.position.set(2.65, 1.1, 0)
carGroup.add(grill)

const headlightGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.24, 24)
const headlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xfbf5d5,
  emissive: 0xfff2c4,
  emissiveIntensity: 0.85,
  roughness: 0.22,
  metalness: 0.18
})
const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial.clone())
headlightLeft.rotation.z = Math.PI / 2
headlightLeft.position.set(2.7, 1, 0.6)
carGroup.add(headlightLeft)

const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial.clone())
headlightRight.rotation.z = Math.PI / 2
headlightRight.position.set(2.7, 1, -0.6)
carGroup.add(headlightRight)

const taillightMaterial = new THREE.MeshStandardMaterial({ color: 0xff3a3a, emissive: 0xff1c1c, emissiveIntensity: 0.6, roughness: 0.8 })
const taillightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), taillightMaterial)
taillightLeft.position.set(-2.85, 1.05, 0.55)
carGroup.add(taillightLeft)

const taillightRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), taillightMaterial.clone())
taillightRight.position.set(-2.85, 1.05, -0.55)
carGroup.add(taillightRight)

const wheelGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 32)
const hubGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24)
const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 12)
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 })
const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xb5bec7, metalness: 0.9, roughness: 0.15 })

const createWheel = (x: number, z: number) => {
  const tire = new THREE.Mesh(wheelGeometry, wheelMaterial)
  tire.rotation.z = Math.PI / 2
  tire.castShadow = true
  tire.position.set(x, 0.55, z)
  carGroup.add(tire)

  const hub = new THREE.Mesh(hubGeometry, rimMaterial)
  hub.rotation.z = Math.PI / 2
  hub.position.set(x, 0.55, z)
  carGroup.add(hub)

  const rim = new THREE.Mesh(rimGeometry, rimMaterial)
  rim.rotation.z = Math.PI / 2
  rim.position.set(x, 0.55, z)
  carGroup.add(rim)
}

createWheel(1.6, 1)
createWheel(1.6, -1)
createWheel(-1.6, 1)
createWheel(-1.6, -1)

const createHeadlightSpot = (offsetZ: number) => {
  const light = new THREE.SpotLight(0xfff8d4, 0, 170, Math.PI / 6.5, 0.15, 1)
  light.position.set(2.6, 1.05, offsetZ)
  light.target.position.set(40, 0.3, offsetZ * 0.8)
  light.castShadow = true
  light.shadow.mapSize.set(1024, 1024)
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 160
  light.shadow.bias = -0.0001

  carGroup.add(light)
  carGroup.add(light.target)

  return light
}

const headlightSpots = [createHeadlightSpot(0.6), createHeadlightSpot(-0.6)]
const headlightMeshes = [headlightLeft, headlightRight]
let headlightsOn = true

const setHeadlights = (on: boolean) => {
  headlightsOn = on
  const intensity = on ? 32 : 0
  headlightSpots.forEach(light => {
    light.intensity = intensity
  })
  headlightMeshes.forEach(mesh => {
    const material = mesh.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = on ? 3.2 : 0.2
  })
}

setHeadlights(headlightsOn)

const cabinGlow = new THREE.PointLight(0x4d6eff, 1.3, 6, 1.8)
cabinGlow.position.set(-0.4, 1.8, 0)
carGroup.add(cabinGlow)

const carDetailLight = new THREE.SpotLight(0x6a8cff, 0.85, 8, Math.PI / 3, 0.65, 1.4)
carDetailLight.position.set(0, 2.4, 0)
carDetailLight.target.position.set(0, 1, 0)
carDetailLight.castShadow = false
carGroup.add(carDetailLight)
carGroup.add(carDetailLight.target)

const globalAmbient = new THREE.AmbientLight(0x6f7f9f, 0)
const globalDirectional = new THREE.DirectionalLight(0xbfd2ff, 0)
globalDirectional.position.set(30, 60, 10)
globalDirectional.castShadow = false
scene.add(globalAmbient)
scene.add(globalDirectional)

let globalLightOn = false

const setGlobalLight = (on: boolean) => {
  globalLightOn = on
  const targetAmbient = on ? 0.6 : 0
  const targetDirectional = on ? 1.1 : 0
  globalAmbient.intensity = targetAmbient
  globalDirectional.intensity = targetDirectional
}

setGlobalLight(globalLightOn)

const buildingBoxes: THREE.Box3[] = []
const buildingTextures = createBuildingTextures()

const addBuilding = (config: BuildingConfig) => {
  const buildingGroup = buildBuildingGroup(config, buildingTextures)
  scene.add(buildingGroup)
  buildingGroup.updateMatrixWorld(true)
  buildingBoxes.push(new THREE.Box3().setFromObject(buildingGroup))
}

const districtConfigs: BuildingConfig[] = createCityLayout()
districtConfigs.forEach(addBuilding)

const roadNetwork = createRoadNetwork()
roadNetwork.forEach(mesh => scene.add(mesh))

const sidewalks = createSidewalkRings()
sidewalks.forEach(mesh => scene.add(mesh))

const controlsState = {
  forward: false,
  backward: false,
  left: false,
  right: false
}

const handleCameraMoveKey = (key: string, value: boolean) => {
  switch (key) {
    case 'i':
      cameraMoveState.forward = value
      return true
    case 'k':
      cameraMoveState.backward = value
      return true
    case 'j':
      cameraMoveState.left = value
      return true
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
    case 'arrowup':
      controlsState.forward = value
      break;
    case 's':
    case 'arrowdown':
      controlsState.backward = value
      break;
    case 'a':
    case 'arrowleft':
      controlsState.left = value
      break;
    case 'd':
    case 'arrowright':
      controlsState.right = value
      break;
  }
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
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

window.addEventListener('keyup', (event: KeyboardEvent) => {
  const key = event.key.toLowerCase()
  if (handleCameraMoveKey(key, false))
    return

  handleMovementKey(key, false)
})

const moveParams = {
  acceleration: 22,
  deceleration: 26,
  maxForwardSpeed: 14,
  maxReverseSpeed: 5,
  turnSpeed: Math.PI
}

const driveBounds = 200
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
    carGroup.position.x > driveBounds ||
    carGroup.position.x < -driveBounds ||
    carGroup.position.z > driveBounds ||
    carGroup.position.z < -driveBounds
  ) {
    blocked = true
  } else {
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
  cameraPivot.position.y = THREE.MathUtils.clamp(cameraPivot.position.y, 0.5, 120)
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
