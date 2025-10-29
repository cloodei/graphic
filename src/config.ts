export const SETTINGS = {
  world: {
    bounds: 600,
    groundSize: 600,
    groundColor: 0x1e222b,
    fogColor: 0x000000
  },
  city: {
    gridRadius: 16,
    spacing: 24,
    building: {
      widthRange: [7.5, 13.5],
      depthRange: [7.5, 13.5],
      heightRange: [8, 20],
      baseHeight: 0.5,
      bodyColor: 0x343b48,
      roofColor: 0x252b35,
      foundationColor: 0x181d25,
      jitter: 1.5
    },

    fence: {
      color: 0x4a5568,
      roughness: 0.85,
      metalness: 0.1,
      height: 4,
      thickness: 1,
      minDistance: 6,
      maxDistanceFactor: 1.8,
      desiredCount: 60,
      attemptsMultiplier: 12
    }
  },
  camera: {
    fov: 55,
    clipping: {
      near: 0.1,
      far: 400
    },
    rotationSpeed: 0.006,
    zoomStep: 0.012,
    move: {
      baseSpeed: 18,
      boostMultiplier: 2,
      heightClamp: {
        min: 0.5,
        max: 70
      }
    }
  },
  vehicle: {
    acceleration: 16,
    deceleration: 22,
    maxForwardSpeed: 15,
    maxReverseSpeed: 7,
    turnSpeed: Math.PI * 0.85,

    headlights: {
      color: 0xfff8d4,
      intensity: 120,
      distance: 200,
      angle: Math.PI / 5,
      penumbra: 0.15,
      decay: 1,
      emissiveIntensity: 6.4,
      offsetZ: 0.6
    }
  }
} as const
