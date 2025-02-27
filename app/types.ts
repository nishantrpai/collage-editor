export interface Layout {
  id: string
  name: string
  areas: string
  cells: { id: string }[]
  gap?: number
  isCustom?: boolean
}

export interface ImageTransform {
  zoom: number
  offsetX: number
  offsetY: number
  rotation: number
  scale: number
}

export interface CollageState {
  images: string[]
  imageTransforms: Record<string, ImageTransform>
}

