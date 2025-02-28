"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import type { Layout } from "./types"

interface LayoutSelectorProps {
  layouts: Layout[]
  selected: Layout
  onSelect: (layout: Layout) => void
  onGapChange: (gap: number) => void
  onBackgroundColorChange: (color: string) => void
  backgroundColor: string
  onDeleteLayout?: (layoutId: string) => void
  onEditLayout?: (layout: Layout) => void
}

export function LayoutSelector({
  layouts,
  selected,
  onSelect,
  onGapChange,
  onBackgroundColorChange,
  backgroundColor,
  onDeleteLayout,
  onEditLayout,
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
          <div
            key={index}
            className="relative group"
          >
            <button
              className={cn(
                "p-2 border rounded cursor-pointer hover:bg-accent transition-colors dark:border-gray-700 dark:hover:bg-gray-700 w-full",
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
            
            {layout.isCustom && (
              <div className="absolute top-2 right-2 invisible group-hover:visible flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-6 h-6 shadow-md bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLayout(layout);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="w-6 h-6 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayout(layout.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
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
