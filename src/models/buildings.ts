import * as THREE from 'three'
import type { BuildingConfig } from '../types'
import { SETTINGS } from '../config'

const foundationMaterial = new THREE.MeshStandardMaterial({
  color: SETTINGS.city.building.foundationColor,
  roughness: 0.95,
  metalness: 0.02
})

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: SETTINGS.city.building.bodyColor,
  roughness: 0.85,
  metalness: 0.08
})

const roofMaterial = new THREE.MeshStandardMaterial({
  color: SETTINGS.city.building.roofColor,
  roughness: 0.9,
  metalness: 0.05
})

const createBuildingGroup = ({ x, z, width, depth, height }: BuildingConfig) => {
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(width + 1, SETTINGS.city.building.baseHeight, depth + 1),
    foundationMaterial
  )
  foundation.position.y = SETTINGS.city.building.baseHeight / 2
  foundation.receiveShadow = true
  group.add(foundation)

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMaterial)
  body.position.y = SETTINGS.city.building.baseHeight + height / 2
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(width, 0.6, depth), roofMaterial)
  roof.position.y = SETTINGS.city.building.baseHeight + height + 0.3
  roof.castShadow = true
  roof.receiveShadow = true
  group.add(roof)

  return group
}

const generateCityLayout = () => {
  const configs: BuildingConfig[] = []
  const { gridRadius, spacing, building } = SETTINGS.city

  for (let gx = -gridRadius; gx <= gridRadius; gx++) {
    for (let gz = -gridRadius; gz <= gridRadius; gz++) {
      if (gx === 0 && gz === 0)
        continue

      const jitterX = THREE.MathUtils.randFloatSpread(building.jitter)
      const jitterZ = THREE.MathUtils.randFloatSpread(building.jitter)
      const centerX = gx * spacing + jitterX
      const centerZ = gz * spacing + jitterZ

      const width = THREE.MathUtils.randFloat(...building.widthRange)
      const depth = THREE.MathUtils.randFloat(...building.depthRange)
      const height = THREE.MathUtils.randFloat(...building.heightRange)

      configs.push({ x: centerX, z: centerZ, width, depth, height })
    }
  }

  return configs
}

const buildingConfigs = generateCityLayout()
export const buildingGroups = buildingConfigs.map(createBuildingGroup)

buildingGroups.forEach(group => group.updateMatrixWorld(true))
export const buildingBoxes = buildingGroups.map(group => new THREE.Box3().setFromObject(group))
