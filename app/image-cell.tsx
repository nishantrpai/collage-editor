"use client"

import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { cn } from "@/lib/utils"
import { Image, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageTransform } from "./types"

interface ImageCellProps {
  cellId: string
  gridArea: string
  image?: string
  transform?: ImageTransform
  backgroundColor?: string
  onClick?: (e: React.MouseEvent) => void
  onRemove?: () => void
  isSelected?: boolean
  isPreview?: boolean
  isSaving?: boolean
  gridPercentage: { width: number; height: number; offsetX: number; offsetY: number }
  isFreeFlow: boolean
  zIndex: number
  theme?: string
}

export function ImageCell({
  cellId,
  gridArea,
  image,
  transform = { zoom: 1, offsetX: 0, offsetY: 0, rotation: 0, scale: 1 },
  backgroundColor,
  onClick,
  onRemove,
  isSelected,
  isPreview,
  isSaving,
  gridPercentage,
  isFreeFlow,
  zIndex,
  theme,
}: ImageCellProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "IMAGE_CELL",
    item: { id: cellId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isFreeFlow && !isPreview,
  })

  const [{ isOver }, drop] = useDrop({
    accept: "IMAGE_CELL",
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const defaultBackground = theme === 'dark' ? '#000000' : '#ffffff'
  const cellBackground = backgroundColor || defaultBackground

  // Base cell style with grid positioning
  const cellStyle = {
    gridArea: gridArea,
    position: "relative" as const,
    backgroundColor: cellBackground, // Use the cell-specific background
    borderRadius: `${transform?.borderRadius || 0}px`,
    ...(isFreeFlow && {
      transform: `translate(${gridPercentage.offsetX}%, ${gridPercentage.offsetY}%)`,
      zIndex: zIndex,
      cursor: "move",
      opacity: isDragging ? 0.5 : 1,
    }),
  }

  // Create a wrapper div for grid sizing
  const gridSizeStyle = {
    width: isFreeFlow ? `${gridPercentage.width}%` : '100%',
    height: isFreeFlow ? `${gridPercentage.height}%` : '100%',
    position: 'relative' as const,
  }

  const imageContainerRef = React.useRef<HTMLDivElement>(null)

  const combinedRef = (el: HTMLDivElement) => {
    drag(el)
    drop(el)
    imageContainerRef.current = el
  }

  return (
    <div
      ref={isFreeFlow ? combinedRef : undefined}
      style={cellStyle}
      className={`overflow-visible ${isSelected && !isPreview && !isSaving ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
      data-cell-id={cellId}
    >
      <div style={gridSizeStyle}>
        {image ? (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: `${transform?.borderRadius || 0}px`,
                backgroundColor: cellBackground, // Apply the correct background color here
              }}
            >
              {/* Main fix: Added parent container with transform-origin set to center */}
              <div
                className="w-full h-full"
                style={{
                  transformOrigin: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    transform: `scale(${transform?.zoom || 1})`,
                    transformOrigin: "center",
                    position: "relative",
                    overflow: "visible"
                  }}
                >
                  <img
                    src={image}
                    alt="Collage image"
                    className="absolute w-full h-full object-cover"
                    style={{
                      transform: `translate(${transform?.offsetX || 0}px, ${
                        transform?.offsetY || 0
                      }px) rotate(${transform?.rotation || 0}deg) scale(${transform?.scale || 1})`,
                      transformOrigin: "center",
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
            {!isPreview && !isSaving && isSelected && onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </>
        ) : (
          <div 
          // black font
          // make background opacity 0.5
            className="absolute inset-0 flex items-center justify-center text-black bg-opacity-50"
            // style={{
            //   backgroundColor: cellBackground, // Apply the correct background color here too
            // }}
          >
            <span className="text-sm">
              <ImagePlus className="h-6 w-6" />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
