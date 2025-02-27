"use client"

import React from "react"
import { useDrag, useDrop } from "react-dnd"
import { cn } from "@/lib/utils"
import { Image, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageTransform } from "./types"

interface ImageCellProps {
  cellId: string
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

  const cellStyle = isFreeFlow
    ? {
        position: "absolute" as const,
        width: `${gridPercentage.width}%`,
        height: `${gridPercentage.height}%`,
        left: `${gridPercentage.offsetX}%`,
        top: `${gridPercentage.offsetY}%`,
        zIndex: zIndex,
        backgroundColor: backgroundColor || defaultBackground,
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
      }
    : {
        gridArea: cellId,
        backgroundColor: backgroundColor || defaultBackground,
        position: "relative" as const,
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
      style={{
        ...cellStyle,
        borderRadius: `${transform?.borderRadius || 0}px`,
      }}
      className={`overflow-hidden ${isSelected && !isPreview && !isSaving ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
      data-cell-id={cellId}
    >
      {image ? (
        <>
          <div
            className="w-full h-full relative overflow-hidden"
            style={{
              transform: `scale(${transform?.zoom || 1})`,
              borderRadius: `${transform?.borderRadius || 0}px`,
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
        <div className="w-full h-full flex items-center justify-center bg-muted/20 dark:bg-black">
          <span className=" text-sm">
            <ImagePlus className="h-6 w-6" />
          </span>
        </div>
      )}
    </div>
  )
}
