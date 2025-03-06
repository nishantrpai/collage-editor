export interface Layout {
  id: string
  name: string
  areas: string
  cells: { id: string }[]
  isCustom?: boolean
  gap?: number
}

export interface ImageTransform {
  zoom: number
  offsetX: number
  offsetY: number
  rotation: number
  scale: number
  borderRadius: number
}

export type MediaItem = {
  type: 'image' | 'video'
  url: string
}

export interface CollageState {
  media: MediaItem[]
  imageTransforms: Record<string, ImageTransform>
  cellMediaMap: Record<string, number>
  cellBackgroundColors: Record<string, string>
  gridPercentages: Record<string, { width: number; height: number; offsetX: number; offsetY: number }>
  zIndexes: Record<string, number>
}
