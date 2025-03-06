"use client"

import { useRef, useState, useEffect } from "react"
import { useDrag } from "react-dnd"
import type { ImageTransform, MediaItem } from "./types"
import { Trash } from "lucide-react"

interface MediaCellProps {
  cellId: string
  gridArea: string
  media?: MediaItem
  transform?: ImageTransform
  backgroundColor?: string
  onClick?: (e: React.MouseEvent) => void
  onRemove?: () => void
  isSelected?: boolean
  isPreview?: boolean
  isSaving?: boolean
  gridPercentage?: {
    width: number
    height: number
    offsetX: number
    offsetY: number
  }
  isFreeFlow?: boolean
  zIndex?: number
  theme?: string
}

export function MediaCell({
  cellId,
  gridArea,
  media,
  transform = { zoom: 1, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, borderRadius: 0 },
  backgroundColor = "#ffffff",
  onClick,
  onRemove,
  isSelected,
  isPreview,
  isSaving,
  gridPercentage = { width: 100, height: 100, offsetX: 0, offsetY: 0 },
  isFreeFlow = false,
  zIndex = 0,
  theme,
}: MediaCellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  // Simplify the cell style when saving to prevent issues with html2canvas
  const cellStyle = isSaving
    ? {
        gridArea,
        backgroundColor,
        overflow: "hidden",
        borderRadius: `${transform.borderRadius}%`,
      }
    : {
        gridArea,
        backgroundColor,
        overflow: "hidden",
        transition: isPreview ? "none" : "all 0.2s ease",
        position: isFreeFlow ? "absolute" : "relative",
        border: isSelected ? `2px solid ${theme === "dark" ? "white" : "black"}` : "none",
        boxSizing: "border-box" as const,
        width: isFreeFlow ? `${gridPercentage.width}%` : "100%",
        height: isFreeFlow ? `${gridPercentage.height}%` : "100%",
        left: isFreeFlow ? `${gridPercentage.offsetX}%` : "auto",
        top: isFreeFlow ? `${gridPercentage.offsetY}%` : "auto",
        zIndex: isFreeFlow ? zIndex : "auto",
        borderRadius: `${transform.borderRadius}%`,
      }

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CELL",
      item: { id: cellId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [cellId]
  )

  // Only make the cell draggable if it's free flow mode and the cell is selected
  useEffect(() => {
    if (ref.current && isFreeFlow && isSelected) {
      drag(ref)
    }
  }, [isFreeFlow, isSelected, drag])

  // Calculate transform style for the media
  const mediaTransformStyle = {
    transformOrigin: "center",
    transform: `scale(${transform.zoom}) translate(${transform.offsetX}px, ${transform.offsetY}px) rotate(${transform.rotation}deg)`,
  }
  
  return (
    <div
      ref={ref}
      style={cellStyle}
      onClick={onClick}
      onMouseEnter={() => !isPreview && setIsHovering(true)}
      onMouseLeave={() => !isPreview && setIsHovering(false)}
    >
      {media ? (
        media.type === 'image' ? (
          <img
            src={media.url}
            alt=""
            className="w-full h-full object-cover"
            style={mediaTransformStyle}
            draggable={false}
          />
        ) : (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            style={mediaTransformStyle}
            autoPlay={!isPreview}
            loop
            muted
            playsInline
            controls={false}
            draggable={false}
          />
        )
      ) : (
        // Empty placeholder
        <div 
          className="w-full h-full flex items-center justify-center text-muted-foreground"
          style={{
            backgroundColor: backgroundColor || (theme === 'dark' ? '#333' : '#f0f0f0'),
          }}
        >
          {isPreview ? null : <span>Drop image/video here</span>}
        </div>
      )}

      {/* Remove button - only show when hovering and not in preview mode */}
      {!isPreview && isHovering && media && onRemove && (
        <button
          className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash size={16} />
        </button>
      )}

      {/* Show a slightly visible border when hovering over a cell in edit mode */}
      {!isPreview && isHovering && !isSelected && (
        <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none"></div>
      )}
    </div>
  )
}
