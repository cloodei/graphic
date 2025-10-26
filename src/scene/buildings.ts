import * as THREE from 'three'
import type { BuildingConfig, RoofStyle } from '../types'
import { createRoofTexture, createFacadeTexture } from './textures'

export interface BuildingTextures {
  facades: THREE.Texture[]
  accents: THREE.Texture[]
  roofs: THREE.Texture[]
}

export const createBuildingTextures = () => {
  const facades = [
    createFacadeTexture('#1c2940', '#b7d4ff'),
    createFacadeTexture('#242f45', '#ffd169'),
    createFacadeTexture('#1b2d3f', '#82a6ff'),
    createFacadeTexture('#2a3346', '#ffefba')
  ]

  const accents = [createFacadeTexture('#2d3a4f', '#c9d6ff'), createFacadeTexture('#253347', '#ffcfa3')]
  const roofs = [createRoofTexture()]

  return { facades, accents, roofs }
}

export const createBuildingSection = (width: number, height: number, depth: number, textures: BuildingTextures) => {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const facadeTexture = textures.facades[Math.floor(Math.random() * textures.facades.length)].clone()
  const sideTexture = textures.accents[Math.floor(Math.random() * textures.accents.length)].clone()
  const roofTexture = textures.roofs[Math.floor(Math.random() * textures.roofs.length)].clone()

  facadeTexture.wrapS = THREE.RepeatWrapping
  facadeTexture.wrapT = THREE.RepeatWrapping
  sideTexture.wrapS = THREE.RepeatWrapping
  sideTexture.wrapT = THREE.RepeatWrapping
  roofTexture.wrapS = THREE.RepeatWrapping
  roofTexture.wrapT = THREE.RepeatWrapping

  const repeatX = Math.max(1, Math.round(width / 4))
  const repeatY = Math.max(1, Math.round(height / 3))
  facadeTexture.repeat.set(repeatX, repeatY)
  sideTexture.repeat.set(Math.max(1, Math.round(depth / 4)), repeatY)
  roofTexture.repeat.set(Math.max(1, Math.round(width / 6)), Math.max(1, Math.round(depth / 6)))
  facadeTexture.needsUpdate = true
  sideTexture.needsUpdate = true
  roofTexture.needsUpdate = true

  const facadeMaterial = new THREE.MeshStandardMaterial({ map: facadeTexture, roughness: 0.85, metalness: 0.18 })
  const sideMaterial = new THREE.MeshStandardMaterial({ map: sideTexture, roughness: 0.9, metalness: 0.15 })
  const roofMaterial = new THREE.MeshStandardMaterial({ map: roofTexture, roughness: 0.92, metalness: 0.12 })

  const materials = [facadeMaterial, facadeMaterial, sideMaterial, sideMaterial, roofMaterial, roofMaterial]
  return new THREE.Mesh(geometry, materials)
}

export const createRoof = (width: number, depth: number, style: RoofStyle) => {
  switch (style) {
    case 'angled': {
      const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.6, Math.max(width, depth) * 0.45, 4)
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x2a303d, metalness: 0.2, roughness: 0.7 })
      const roof = new THREE.Mesh(roofGeometry, roofMaterial)
      roof.rotation.y = Math.PI / 4
      return roof
    }
    case 'helipad': {
      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(Math.max(width, depth) * 0.4, Math.max(width, depth) * 0.4, 0.6, 32),
        new THREE.MeshStandardMaterial({ color: 0x20252f, roughness: 0.8, metalness: 0.2 })
      )
      const helipad = new THREE.Mesh(
        new THREE.RingGeometry(Math.max(width, depth) * 0.15, Math.max(width, depth) * 0.35, 32),
        new THREE.MeshBasicMaterial({ color: 0xfff276, side: THREE.DoubleSide })
      )
      helipad.rotation.x = -Math.PI / 2
      helipad.position.y = 0.35
      platform.add(helipad)
      return platform
    }
    default: {
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width * 1.02, 0.6, depth * 1.02),
        new THREE.MeshStandardMaterial({ color: 0x171c26, roughness: 0.88, metalness: 0.1 })
      )
      return roof
    }
  }
}

export const buildBuildingGroup = (config: BuildingConfig, textures: BuildingTextures) => {
  const { x, z, width, depth, height, floors, roofStyle } = config
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  const floorHeight = height / floors
  for (let i = 0; i < floors; i++) {
    const y = floorHeight * i
    const facadeMesh = createBuildingSection(width, floorHeight, depth, textures)
    facadeMesh.position.set(0, y + floorHeight / 2, 0)
    group.add(facadeMesh)
  }

  const roof = createRoof(width, depth, roofStyle)
  roof.position.y = height
  group.add(roof)

  group.traverse(obj => {
    obj.castShadow = true
    obj.receiveShadow = true
  })

  return group
}
