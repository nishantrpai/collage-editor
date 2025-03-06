"use client"

import type { Layout, CollageState } from "./types"
import { MediaCell } from "./media-cell"

interface CollageCanvasProps {
  layout: Layout
  collageState: CollageState
  onCellSelect?: (cellId: string | null) => void
  onRemoveMedia?: (cellId: string) => void
  selectedCellId?: string | null
  isPreview?: boolean
  isSaving?: boolean
  backgroundColor: string
  isFreeFlow: boolean
  theme?: string
}

export function CollageCanvas({
  layout,
  collageState,
  onCellSelect,
  onRemoveMedia,
  selectedCellId,
  isPreview,
  isSaving,
  backgroundColor,
  isFreeFlow,
  theme,
}: CollageCanvasProps) {
  // Always maintain grid layout, even in free flow mode
  const gridStyle = {
    display: "grid",
    gridTemplateAreas: layout.areas,
    gap: layout.gap ?? 8,
    position: 'relative' as const,
  }

  // Use the provided backgroundColor directly
  const bgColor = backgroundColor || (theme === 'dark' ? '#000000' : '#ffffff')

  return (
    <div
      className="w-full h-full relative"
      style={{
        backgroundColor: bgColor,
        ...gridStyle,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onCellSelect && onCellSelect(null)
      }}
    >
      {layout.cells.map((cell, index) => {
        const cellId = cell.id
        const gridPercentage = collageState.gridPercentages[cellId] || {
          width: 100,
          height: 100,
          offsetX: 0,
          offsetY: 0,
        }
        const mediaIndex = collageState.cellMediaMap[cellId]
        const mediaItem = typeof mediaIndex === 'number' ? collageState.media[mediaIndex] : undefined
        
        return (
          <MediaCell
            key={index}
            cellId={cellId}
            gridArea={cellId}
            media={mediaItem}
            transform={collageState.imageTransforms[cellId]}
            backgroundColor={collageState.cellBackgroundColors[cellId] || bgColor}
            onClick={(e) => {
              e.stopPropagation()
              onCellSelect && onCellSelect(cellId)
            }}
            onRemove={onRemoveMedia ? () => onRemoveMedia(cellId) : undefined}
            isSelected={selectedCellId === cellId}
            isPreview={isPreview}
            isSaving={isSaving}
            gridPercentage={gridPercentage}
            isFreeFlow={isFreeFlow}
            zIndex={collageState.zIndexes[cellId] || 0}
            theme={theme}
          />
        )
      })}
    </div>
  )
}
