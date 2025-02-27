"use client"

import { useTheme } from "next-themes"
import { CollageCanvas } from "./collage-canvas"
import type { Layout, CollageState } from "./types"

interface AllLayoutsPreviewProps {
  layouts: Layout[]
  collageState: CollageState
  backgroundColor?: string
}

export function AllLayoutsPreview({ layouts, collageState, backgroundColor }: AllLayoutsPreviewProps) {
  const { theme } = useTheme()
  const bgColor = backgroundColor || (theme === 'dark' ? '#000000' : '#ffffff')

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {layouts.map((layout) => (
        <div key={layout.id} className="aspect-square overflow-hidden rounded border dark:border-gray-800">
          <CollageCanvas
            layout={layout}
            collageState={collageState}
            isPreview={true}
            backgroundColor={bgColor}
            isFreeFlow={false}
            theme={theme}
          />
        </div>
      ))}
    </div>
  )
}
