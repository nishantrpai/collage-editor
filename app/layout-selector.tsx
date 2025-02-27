"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Layout } from "./types"

interface LayoutSelectorProps {
  layouts: Layout[]
  selected: Layout
  onSelect: (layout: Layout) => void
  onGapChange: (gap: number) => void
  onBackgroundColorChange: (color: string) => void
  backgroundColor: string
}

export function LayoutSelector({
  layouts,
  selected,
  onSelect,
  onGapChange,
  onBackgroundColorChange,
  backgroundColor,
}: LayoutSelectorProps) {
  const [gap, setGap] = useState(selected.gap || 8)

  const handleGapChange = (value: number[]) => {
    setGap(value[0])
    onGapChange(value[0])
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-2">
        {layouts.map((layout, index) => (
          <button
            key={index}
            className={cn(
              "p-2 border rounded hover:bg-accent transition-colors dark:border-gray-700 dark:hover:bg-gray-700",
              selected.id === layout.id && "border-primary bg-accent dark:border-primary dark:bg-gray-600",
            )}
            onClick={() => onSelect(layout)}
          >
            <div className="aspect-square w-full bg-muted p-1 dark:bg-gray-800">
              <div
                className="w-full h-full grid"
                style={{
                  gridTemplateAreas: layout.areas,
                  gap: `${gap}px`,
                }}
              >
                {layout.cells.map((cell, i) => (
                  <div
                    key={i}
                    className="bg-background border dark:bg-gray-700 dark:border-gray-600"
                    style={{ gridArea: cell.id }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-1 text-xs truncate dark:text-gray-300">{layout.name}</div>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Gap: {gap}px</Label>
        <Slider value={[gap]} onValueChange={handleGapChange} min={0} max={32} step={1} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bg-color">Background Color</Label>
        <Input
          id="bg-color"
          type="color"
          value={backgroundColor}
          onChange={(e) => onBackgroundColorChange(e.target.value)}
          className="h-10 p-1"
        />
      </div>
    </div>
  )
}

