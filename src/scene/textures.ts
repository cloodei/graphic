import * as THREE from 'three'

export const createFacadeTexture = (base: string, windows: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const baseColor = new THREE.Color(base)
  const topColor = baseColor.clone().offsetHSL(0, 0, 0.08)
  const bottomColor = baseColor.clone().offsetHSL(0, 0, -0.08)
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, `#${topColor.getHexString()}`)
  gradient.addColorStop(1, `#${bottomColor.getHexString()}`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const columns = 6
  const rows = 8
  const paddingX = 16
  const paddingY = 18
  const cellW = (256 - paddingX * 2) / columns
  const cellH = (256 - paddingY * 2) / rows

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const flicker = 0.55 + Math.random() * 0.35
      ctx.fillStyle = windows
      ctx.globalAlpha = flicker
      const offsetX = paddingX + x * cellW + cellW * 0.12
      const offsetY = paddingY + y * cellH + cellH * 0.14
      ctx.fillRect(offsetX, offsetY, cellW * 0.76, cellH * 0.68)
      ctx.globalAlpha = 1
    }
  }

  ctx.fillStyle = '#1a1d24'
  ctx.fillRect(0, 0, 256, 10)
  ctx.fillRect(0, 246, 256, 10)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export const createRoofTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1e222b'
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = '#2b303b'
  ctx.lineWidth = 4
  for (let i = 0; i < 256; i += 32) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(256, i)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 256)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export const createAsphaltTexture = () => {
  const canvas = document.createElement('canvas')
  const size = 256
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0b0d11'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 2200; i++) {
    const value = 20 + Math.random() * 40
    ctx.fillStyle = `rgba(${value}, ${value + 5}, ${value + 10}, ${0.25 + Math.random() * 0.2})`
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 1.6
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

export const createRoadTexture = () => {
  const canvas = document.createElement('canvas')
  const size = 512
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const baseGradient = ctx.createLinearGradient(0, 0, 0, size)
  baseGradient.addColorStop(0, '#111319')
  baseGradient.addColorStop(1, '#1a1d24')
  ctx.fillStyle = baseGradient
  ctx.fillRect(0, 0, size, size)

  const noiseCount = Math.floor(size * size * 0.08)
  for (let i = 0; i < noiseCount; i++) {
    const tint = 18 + Math.random() * 40
    ctx.fillStyle = `rgba(${tint}, ${tint + 6}, ${tint + 10}, ${0.22 + Math.random() * 0.25})`
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 1.4 + 0.2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = 'rgba(33, 37, 46, 0.6)'
  ctx.lineWidth = 6
  for (let i = 0; i < 3; i++) {
    const offsetX = size * (0.3 + i * 0.2) + Math.random() * 6 - 3
    ctx.beginPath()
    ctx.moveTo(offsetX, -32)
    ctx.lineTo(offsetX + Math.random() * 18 - 9, size + 32)
    ctx.stroke()
  }

  const shoulderWidth = 26
  ctx.fillStyle = '#1b1f27'
  ctx.fillRect(0, 0, shoulderWidth, size)
  ctx.fillRect(size - shoulderWidth, 0, shoulderWidth, size)

  ctx.fillStyle = '#d8d8d8'
  ctx.globalAlpha = 0.85
  ctx.fillRect(shoulderWidth + 6, 0, 6, size)
  ctx.fillRect(size - shoulderWidth - 12, 0, 6, size)
  ctx.globalAlpha = 1

  ctx.fillStyle = '#f6f6f6'
  const segmentHeight = 128
  const dashStart = segmentHeight * 0.25
  const dashHeight = segmentHeight * 0.5
  for (let y = -segmentHeight; y < size + segmentHeight; y += segmentHeight) {
    ctx.fillRect(size / 2 - 8, y + dashStart, 16, dashHeight)
  }

  ctx.fillStyle = 'rgba(70, 78, 96, 0.08)'
  ctx.fillRect(shoulderWidth, 0, size - shoulderWidth * 2, size)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.fillRect(shoulderWidth, size * 0.5, size - shoulderWidth * 2, size * 0.5)

  return canvas
}

export const createSidewalkTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#2a2f39'
  ctx.fillRect(0, 0, 128, 128)

  ctx.strokeStyle = '#3b4452'
  ctx.lineWidth = 4
  for (let i = 0; i <= 128; i += 32) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 128)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(128, i)
    ctx.stroke()
  }

  return canvas
}
