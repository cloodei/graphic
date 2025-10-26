import * as THREE from 'three'
import { createRoadTexture, createSidewalkTexture } from './textures'

export interface InfrastructureOptions {
  roadWidth?: number
  mainLength?: number
  gridRadius?: number
  spacing?: number
  roadTileLengthUnits?: number
  sidewalkRingWidth?: number
}

export const createRoadNetwork = (options: InfrastructureOptions = {}) => {
  const {
    roadWidth = 14,
    mainLength = 520,
    gridRadius = 5,
    spacing = 40,
    roadTileLengthUnits = 64
  } = options

  const meshes: THREE.Mesh[] = []
  const roadTexture = new THREE.CanvasTexture(createRoadTexture())
  roadTexture.wrapS = THREE.RepeatWrapping
  roadTexture.wrapT = THREE.RepeatWrapping
  roadTexture.anisotropy = 8
  roadTexture.colorSpace = THREE.SRGBColorSpace
  roadTexture.needsUpdate = true

  for (let i = -gridRadius; i <= gridRadius; i++) {
    const eastWestTexture = roadTexture.clone()
    eastWestTexture.wrapS = THREE.RepeatWrapping
    eastWestTexture.wrapT = THREE.RepeatWrapping
    eastWestTexture.anisotropy = roadTexture.anisotropy
    eastWestTexture.colorSpace = roadTexture.colorSpace
    eastWestTexture.needsUpdate = true
    const eastWest = new THREE.Mesh(
      new THREE.PlaneGeometry(mainLength, roadWidth),
      new THREE.MeshStandardMaterial({ map: eastWestTexture, roughness: 0.9, metalness: 0.05 })
    )
    eastWest.rotation.x = -Math.PI / 2
    eastWest.position.z = i * spacing
    eastWest.position.y = 0.02
    eastWest.material.map!.repeat.set(mainLength / roadTileLengthUnits, 1)
    meshes.push(eastWest)

    const northSouthTexture = roadTexture.clone()
    northSouthTexture.wrapS = THREE.RepeatWrapping
    northSouthTexture.wrapT = THREE.RepeatWrapping
    northSouthTexture.anisotropy = roadTexture.anisotropy
    northSouthTexture.colorSpace = roadTexture.colorSpace
    northSouthTexture.needsUpdate = true
    const northSouth = new THREE.Mesh(
      new THREE.PlaneGeometry(roadWidth, mainLength),
      new THREE.MeshStandardMaterial({ map: northSouthTexture, roughness: 0.9, metalness: 0.05 })
    )
    northSouth.rotation.x = -Math.PI / 2
    northSouth.position.x = i * spacing
    northSouth.position.y = 0.02
    northSouth.material.map!.repeat.set(1, mainLength / roadTileLengthUnits)
    meshes.push(northSouth)
  }

  return meshes
}

export const createSidewalkRings = (options: InfrastructureOptions = {}) => {
  const {
    spacing = 40,
    sidewalkRingWidth = 6,
    gridRadius = 5,
    mainLength = 520
  } = options

  const meshes: THREE.Mesh[] = []
  const sidewalkTexture = new THREE.CanvasTexture(createSidewalkTexture())
  sidewalkTexture.wrapS = THREE.RepeatWrapping
  sidewalkTexture.wrapT = THREE.RepeatWrapping
  sidewalkTexture.anisotropy = 4

  for (let i = -gridRadius; i <= gridRadius; i++) {
    const horizontalTexture = sidewalkTexture.clone()
    horizontalTexture.wrapS = THREE.RepeatWrapping
    horizontalTexture.wrapT = THREE.RepeatWrapping
    horizontalTexture.needsUpdate = true
    const horizontal = new THREE.Mesh(
      new THREE.PlaneGeometry(mainLength, sidewalkRingWidth),
      new THREE.MeshStandardMaterial({ map: horizontalTexture, roughness: 0.95, metalness: 0.05 })
    )
    horizontal.rotation.x = -Math.PI / 2
    horizontal.position.z = i * spacing + sidewalkRingWidth * 0.8
    horizontal.position.y = 0.018
    horizontal.material.map!.repeat.set(mainLength / 60, sidewalkRingWidth / 4)
    meshes.push(horizontal)

    const verticalTexture = sidewalkTexture.clone()
    verticalTexture.wrapS = THREE.RepeatWrapping
    verticalTexture.wrapT = THREE.RepeatWrapping
    verticalTexture.needsUpdate = true
    const vertical = new THREE.Mesh(
      new THREE.PlaneGeometry(sidewalkRingWidth, mainLength),
      new THREE.MeshStandardMaterial({ map: verticalTexture, roughness: 0.95, metalness: 0.05 })
    )
    vertical.rotation.x = -Math.PI / 2
    vertical.position.x = i * spacing + sidewalkRingWidth * 0.8
    vertical.position.y = 0.018
    vertical.material.map!.repeat.set(sidewalkRingWidth / 4, mainLength / 60)
    meshes.push(vertical)
  }

  return meshes
}
