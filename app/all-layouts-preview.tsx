"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { CollageCanvas } from "./collage-canvas"
import type { Layout, CollageState } from "./types"

interface AllLayoutsPreviewProps {
  layouts: Layout[]
  collageState: CollageState
}

export function AllLayoutsPreview({ layouts, collageState }: AllLayoutsPreviewProps) {
  const handleSave = (layout: Layout) => {
    const saveData = {
      layout,
      state: collageState,
    }
    const blob = new Blob([JSON.stringify(saveData)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collage-${layout.name}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-8 p-4">
      {layouts.map((layout) => (
        <div key={layout.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{layout.name}</h3>
            <Button variant="outline" size="sm" onClick={() => handleSave(layout)}>
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
          <div className="bg-white shadow rounded-lg" style={{ width: "100%", aspectRatio: "1" }}>
            <CollageCanvas layout={layout} collageState={collageState} isPreview />
          </div>
        </div>
      ))}
    </div>
  )
}

