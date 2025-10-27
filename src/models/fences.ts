import * as THREE from 'three'
import { SETTINGS } from '../config'

const tempDirection = new THREE.Vector3()
const midpoint = new THREE.Vector3()

const buildFenceBetween = (
  scene: THREE.Scene,
  groupA: THREE.Group,
  groupB: THREE.Group,
  material: THREE.MeshStandardMaterial,
  buildingBoxes: THREE.Box3[],
  minDistance: number,
  maxDistance: number,
  height: number,
  thickness: number
) => {
  tempDirection.subVectors(groupB.position, groupA.position)
  const length = tempDirection.length()
  if (length <= minDistance || length > maxDistance)
    return false

  const fence = new THREE.Mesh(new THREE.BoxGeometry(length, height, thickness), material)
  fence.castShadow = true
  fence.receiveShadow = true

  midpoint.addVectors(groupA.position, groupB.position).multiplyScalar(0.5)
  fence.position.set(midpoint.x, height / 2, midpoint.z)
  fence.rotation.y = Math.atan2(tempDirection.z, tempDirection.x)

  scene.add(fence)
  fence.updateMatrixWorld(true)
  buildingBoxes.push(new THREE.Box3().setFromObject(fence))
  return true
}

export const createFences = (
  scene: THREE.Scene,
  buildingGroups: THREE.Group[],
  buildingBoxes: THREE.Box3[]
) => {
  if (buildingGroups.length < 2)
    return

  const { fence, spacing } = SETTINGS.city
  const material = new THREE.MeshStandardMaterial({
    color: fence.color,
    roughness: fence.roughness,
    metalness: fence.metalness
  })

  const maxDistance = spacing * fence.maxDistanceFactor
  const attempts = buildingGroups.length * fence.attemptsMultiplier
  const usedPairs = new Set<string>()
  let fencesCreated = 0

  for (let attempt = 0; attempt < attempts && fencesCreated < fence.desiredCount; attempt++) {
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

    if (buildFenceBetween(
      scene,
      groupA,
      groupB,
      material,
      buildingBoxes,
      fence.minDistance,
      maxDistance,
      fence.height,
      fence.thickness
    )) {
      usedPairs.add(key)
      fencesCreated++
    }
  }

  if (fencesCreated || buildingGroups.length < 2)
    return

  let bestA: THREE.Group | null = null
  let bestB: THREE.Group | null = null
  let bestDistance = Infinity

  for (let i = 0; i < buildingGroups.length - 1; i++) {
    for (let j = i + 1; j < buildingGroups.length; j++) {
      const groupA = buildingGroups[i]
      const groupB = buildingGroups[j]
      const distance = groupA.position.distanceTo(groupB.position)
      if (distance <= fence.minDistance || distance > maxDistance)
        continue

      if (distance < bestDistance) {
        bestDistance = distance
        bestA = groupA
        bestB = groupB
      }
    }
  }

  if (bestA && bestB)
    buildFenceBetween(
      scene,
      bestA,
      bestB,
      material,
      buildingBoxes,
      fence.minDistance,
      maxDistance,
      fence.height,
      fence.thickness
    )
}
