"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ImageTransform } from "./types"

interface ImageControlsProps {
  transform: ImageTransform
  backgroundColor: string
  gridPercentage: { width: number; height: number; offsetX: number; offsetY: number }
  zIndex: number
  onChange: (transform: Partial<ImageTransform>) => void
  onBackgroundColorChange: (color: string) => void
  onGridPercentageChange: (
    percentage: Partial<{ width: number; height: number; offsetX: number; offsetY: number }>,
  ) => void
  onZIndexChange: (zIndex: number) => void
  onDone: () => void
}

export function ImageControls({
  transform,
  backgroundColor,
  gridPercentage,
  zIndex,
  onChange,
  onBackgroundColorChange,
  onGridPercentageChange,
  onZIndexChange,
  onDone,
}: ImageControlsProps) {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Image Controls</h3>
        <Button onClick={onDone} variant="secondary">
          Done
        </Button>
      </div>
      <div className="grid gap-2">
        <Label>Zoom ({Math.round(transform.zoom * 100)}%)</Label>
        <Slider
          value={[transform.zoom * 100]}
          onValueChange={(value) => onChange({ zoom: value[0] / 100 })}
          min={10}
          max={200}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Offset X ({transform.offsetX}px)</Label>
        <Slider
          value={[transform.offsetX]}
          onValueChange={(value) => onChange({ offsetX: value[0] })}
          min={-4000}
          max={400}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Offset Y ({transform.offsetY}px)</Label>
        <Slider
          value={[transform.offsetY]}
          onValueChange={(value) => onChange({ offsetY: value[0] })}
          min={-4000}
          max={400}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Rotation ({transform.rotation}°)</Label>
        <Slider
          value={[transform.rotation]}
          onValueChange={(value) => onChange({ rotation: value[0] })}
          min={-180}
          max={180}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Scale ({transform.scale.toFixed(2)}x)</Label>
        <Slider
          value={[transform.scale * 100]}
          onValueChange={(value) => onChange({ scale: value[0] / 100 })}
          min={10}
          max={200}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Grid Width ({gridPercentage.width.toFixed(0)}%)</Label>
        <Slider
          value={[gridPercentage.width]}
          onValueChange={(value) => onGridPercentageChange({ width: value[0] })}
          min={10}
          max={200}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Grid Height ({gridPercentage.height.toFixed(0)}%)</Label>
        <Slider
          value={[gridPercentage.height]}
          onValueChange={(value) => onGridPercentageChange({ height: value[0] })}
          min={10}
          max={200}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Grid Offset X ({gridPercentage.offsetX.toFixed(0)}%)</Label>
        <Slider
          value={[gridPercentage.offsetX]}
          onValueChange={(value) => onGridPercentageChange({ offsetX: value[0] })}
          min={-100}
          max={100}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Grid Offset Y ({gridPercentage.offsetY.toFixed(0)}%)</Label>
        <Slider
          value={[gridPercentage.offsetY]}
          onValueChange={(value) => onGridPercentageChange({ offsetY: value[0] })}
          min={-100}
          max={100}
          step={1}
        />
      </div>
      <div className="grid gap-2">
        <Label>Z-Index ({zIndex})</Label>
        <Slider value={[zIndex]} onValueChange={(value) => onZIndexChange(value[0])} min={0} max={10} step={1} />
      </div>
      <div className="grid gap-2">
        <Label>Background Color</Label>
        <Input type="color" value={backgroundColor} onChange={(e) => onBackgroundColorChange(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Border Radius ({transform.borderRadius || 0}px)</Label>
        <Slider
          value={[transform.borderRadius || 0]}
          onValueChange={(value) => onChange({ borderRadius: value[0] })}
          min={0}
          max={500}
          step={1}
        />
      </div>
    </div>
  )
}
