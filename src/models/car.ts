import * as THREE from 'three'
import { SETTINGS } from '../config'

const { headlights: HEADLIGHTS } = SETTINGS.vehicle

export const carGroup = new THREE.Group()

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

const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial)
headlightLeft.rotation.z = Math.PI / 2
headlightLeft.position.set(2.7, 1, HEADLIGHTS.offsetZ)
carGroup.add(headlightLeft)

const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial)
headlightRight.rotation.z = Math.PI / 2
headlightRight.position.set(2.7, 1, -HEADLIGHTS.offsetZ)
carGroup.add(headlightRight)

const taillightMaterial = new THREE.MeshStandardMaterial({
  color: 0xff3a3a,
  emissive: 0xff1c1c,
  emissiveIntensity: 0.6,
  roughness: 0.8
})

const taillightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), taillightMaterial)
taillightLeft.position.set(-2.85, 1.05, 0.55)
carGroup.add(taillightLeft)

const taillightRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), taillightMaterial)
taillightRight.position.set(-2.85, 1.05, -0.55)
carGroup.add(taillightRight)

const wheelGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 32)
const hubGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24)
const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 12)
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 })
const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xb5bec7, metalness: 0.9, roughness: 0.15 })

const addWheel = (x: number, z: number) => {
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

addWheel(1.6, 1)
addWheel(1.6, -1)
addWheel(-1.6, 1)
addWheel(-1.6, -1)

const createHeadlightSpot = (offsetZ: number) => {
  const light = new THREE.SpotLight(
    HEADLIGHTS.color,
    HEADLIGHTS.intensity,
    HEADLIGHTS.distance,
    HEADLIGHTS.angle,
    HEADLIGHTS.penumbra,
    HEADLIGHTS.decay
  )
  light.position.set(2.6, 1.05, offsetZ)
  light.target.position.set(40, 0.3, offsetZ * 0.8)
  light.castShadow = true
  light.shadow.mapSize.set(1024, 1024)
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 240
  light.shadow.bias = -0.0001

  carGroup.add(light)
  carGroup.add(light.target)

  return light
}

const headlightSpots = [createHeadlightSpot(HEADLIGHTS.offsetZ), createHeadlightSpot(-HEADLIGHTS.offsetZ)]
const headlightMeshes = [headlightLeft, headlightRight]

// const cabinGlow = new THREE.PointLight(0x4d6eff, 1.3, 6, 1.8)
// cabinGlow.position.set(-0.4, 1.8, 0)
// carGroup.add(cabinGlow)

const carDetailLight = new THREE.SpotLight(0x6a8cff, 0.85, 8, Math.PI / 3, 0.65, 1.4)
carDetailLight.position.set(0, 2.4, 0)
carDetailLight.target.position.set(0, 1, 0)
carDetailLight.castShadow = false
carGroup.add(carDetailLight)
carGroup.add(carDetailLight.target)

export const setCarHeadlights = (on: boolean) => {
  const intensity = on ? HEADLIGHTS.intensity : 0
  const emissiveIntensity = on ? HEADLIGHTS.emissiveIntensity : 0

  headlightSpots.forEach(light => light.intensity = intensity)
  headlightMeshes.forEach(mesh => mesh.material.emissiveIntensity = emissiveIntensity)
}
