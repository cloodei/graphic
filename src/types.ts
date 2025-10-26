export type RoofStyle = 'flat' | 'angled' | 'helipad'

export interface BuildingConfig {
  x: number
  z: number
  width: number
  depth: number
  height: number
  floors: number
  roofStyle: RoofStyle
}
