"use client"

import type React from "react"

import { useDrop } from "react-dnd"
import { cn } from "@/lib/utils"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageTransform } from "./types"

interface ImageCellProps {
  cellId: string
  image?: string
  transform?: ImageTransform
  backgroundColor?: string
  onClick?: () => void
  onRemove?: () => void
  isSelected?: boolean
  isPreview?: boolean
  isSaving?: boolean
  gridPercentage: { width: number; height: number; offsetX: number; offsetY: number }
  isFreeFlow: boolean
  zIndex: number
}

export function ImageCell({
  cellId,
  image,
  transform,
  backgroundColor,
  onClick,
  onRemove,
  isSelected,
  isPreview,
  isSaving,
  gridPercentage,
  isFreeFlow,
  zIndex,
}: ImageCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "image",
    drop: () => ({ cellId }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const cellStyle: React.CSSProperties = {
    position: "absolute",
    left: isFreeFlow ? `${gridPercentage.offsetX}%` : 0,
    top: isFreeFlow ? `${gridPercentage.offsetY}%` : 0,
    width: `${gridPercentage.width}%`,
    height: `${gridPercentage.height}%`,
    backgroundColor: backgroundColor || "transparent",
    overflow: "hidden",
    zIndex: zIndex,
  }

  if (!isFreeFlow) {
    cellStyle.gridArea = cellId
  }

  const imageStyle: React.CSSProperties = transform
    ? {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `
          translate(${transform.offsetX}px, ${transform.offsetY}px)
          rotate(${transform.rotation}deg)
          scale(${transform.scale * transform.zoom})
        `,
        transformOrigin: "center center",
      }
    : { width: "100%", height: "100%", objectFit: "cover" }

  return (
    <div
      ref={!isPreview ? drop : undefined}
      style={cellStyle}
      className={cn(
        "relative border-0 border-dashed",
        isOver && "border-primary",
        isSelected && "ring-2 ring-primary ring-offset-2",
        image && "border-none",
      )}
      onClick={onClick}
    >
      {image ? (
        <div className="w-full h-full">
          <img src={image || "/placeholder.svg"} alt="" style={imageStyle} />
          {(isSelected || isPreview) && onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

