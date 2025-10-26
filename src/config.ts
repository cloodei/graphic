export const SETTINGS = {
  world: {
    bounds: 140,
    groundSize: 220,
    groundColor: 0x1e222b as const,
    fogColor: 0x000000 as const
  },
  city: {
    gridRadius: 6,
    spacing: 24,
    building: {
      widthRange: [7.5, 11.5] as const,
      depthRange: [7.5, 11.5] as const,
      heightRange: [10, 18] as const,
      baseHeight: 0.5,
      bodyColor: 0x343b48 as const,
      roofColor: 0x252b35 as const,
      foundationColor: 0x181d25 as const,
      jitter: 1.5
    }
  },
  camera: {
    fov: 55,
    clipping: {
      near: 0.1,
      far: 400
    },
    spherical: {
      radius: 42,
      phi: Math.PI / 3.1,
      theta: Math.PI / 4
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
    maxForwardSpeed: 10,
    maxReverseSpeed: 4,
    turnSpeed: Math.PI * 0.85,

    headlights: {
      color: 0xfff8d4,
      intensity: 100,
      distance: 180,
      angle: Math.PI / 6,
      penumbra: 0.15,
      decay: 1,
      emissiveIntensity: 6.4,
      offsetZ: 0.6
    }
  }
} as const
