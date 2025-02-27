"use client"

import type { Layout, CollageState } from "./types"
import { CollageCanvas } from "./collage-canvas"
import { useTheme } from "next-themes"

interface AllLayoutsPreviewProps {
  layouts: Layout[]
  collageState: CollageState
}

export function AllLayoutsPreview({ layouts, collageState }: AllLayoutsPreviewProps) {
  const { theme } = useTheme()
  const backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {layouts.map((layout) => (
        <div key={layout.id} className="aspect-square overflow-hidden rounded border dark:border-gray-800">
          <CollageCanvas
            layout={layout}
            collageState={collageState}
            isPreview={true}
            backgroundColor={backgroundColor}
            isFreeFlow={false}
            theme={theme}
          />
        </div>
      ))}
    </div>
  )
}
