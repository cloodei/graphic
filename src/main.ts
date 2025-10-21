import * as THREE from 'three'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0a1a)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(8, 5, 9)
camera.lookAt(0, 1, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1c2233, 0.6)
scene.add(hemiLight)

const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
keyLight.position.set(5, 8, 6)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
scene.add(keyLight)

const rimLight = new THREE.SpotLight(0x88ccff, 0.5, 40, Math.PI / 6, 0.3)
rimLight.position.set(-10, 6, -8)
rimLight.target.position.set(0, 1, 0)
scene.add(rimLight)
scene.add(rimLight.target)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x111824, roughness: 0.9, metalness: 0 })
)
ground.rotation.x = -Math.PI / 2
ground.position.y = 0
ground.receiveShadow = true
scene.add(ground)

const carGroup = new THREE.Group()
scene.add(carGroup)

const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5bff, metalness: 0.5, roughness: 0.25 })
const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.7 })
const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0x8fbaff, transmission: 0.7, roughness: 0.05, thickness: 0.2 })

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
  new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 })
)
grill.position.set(2.65, 1.1, 0)
carGroup.add(grill)

const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xfff7b2, emissive: 0xffd966, emissiveIntensity: 0.9 })
const taillightMaterial = new THREE.MeshStandardMaterial({ color: 0xff3a3a, emissive: 0xff1c1c, emissiveIntensity: 0.7 })

const headlightLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 24), headlightMaterial)
headlightLeft.rotation.z = Math.PI / 2
headlightLeft.position.set(2.85, 1, 0.55)
carGroup.add(headlightLeft)

const headlightRight = headlightLeft.clone()
headlightRight.position.z = -0.55
carGroup.add(headlightRight)

const taillightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), taillightMaterial)
taillightLeft.position.set(-2.85, 1.05, 0.55)
carGroup.add(taillightLeft)

const taillightRight = taillightLeft.clone()
taillightRight.position.z = -0.55
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

carGroup.rotation.y = Math.PI / 6

const animate = () => {
  requestAnimationFrame(animate)
  carGroup.rotation.y += 0.0025
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
