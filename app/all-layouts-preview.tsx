"use client"

import { useTheme } from "next-themes"
import { CollageCanvas } from "./collage-canvas"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Layout, CollageState } from "./types"

interface AllLayoutsPreviewProps {
  layouts: Layout[]
  collageState: CollageState
  backgroundColor?: string
  onDeleteLayout?: (layoutId: string) => void
}

export function AllLayoutsPreview({ 
  layouts, 
  collageState, 
  backgroundColor,
  onDeleteLayout 
}: AllLayoutsPreviewProps) {
  const { theme } = useTheme()
  const bgColor = backgroundColor || (theme === 'dark' ? '#000000' : '#ffffff')

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {layouts.map((layout) => (
        <div key={layout.id} className="aspect-square overflow-hidden rounded border dark:border-gray-800 relative group">
          <CollageCanvas
            layout={layout}
            collageState={collageState}
            isPreview={true}
            backgroundColor={bgColor}
            isFreeFlow={false}
            theme={theme}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 dark:bg-black/80">
            <span className="text-xs font-medium">{layout.name}</span>
          </div>
          
          {layout.isCustom && (
            <div className="absolute top-2 right-2 invisible group-hover:visible">
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-7 h-7 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayout(layout.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
