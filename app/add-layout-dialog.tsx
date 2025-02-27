"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Layout } from "./types"

interface AddLayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (layout: Layout) => void
  layoutToEdit?: Layout | null
}

export function AddLayoutDialog({ open, onOpenChange, onAdd, layoutToEdit }: AddLayoutDialogProps) {
  const [name, setName] = useState("")
  const [gap, setGap] = useState(8)
  const [customLayout, setCustomLayout] = useState(
    JSON.stringify(
      {
        areas: ["cell1 cell2", "cell3 cell2", "cell4 cell4"],
      },
      null,
      2,
    ),
  )
  const [previewAreas, setPreviewAreas] = useState<string[]>([])
  const [cells, setCells] = useState<{ id: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  // Handle initial setup when editing an existing layout
  useEffect(() => {
    if (layoutToEdit) {
      setName(layoutToEdit.name)
      setGap(layoutToEdit.gap || 8)
      
      // Convert the layout's areas string back to the expected format
      const areas = layoutToEdit.areas
        .split('\n')
        .map(row => row.replace(/"/g, '').trim())
      
      setCustomLayout(JSON.stringify({ areas }, null, 2))
      setPreviewAreas(areas)
      setCells(layoutToEdit.cells)
    }
  }, [layoutToEdit])

  useEffect(() => {
    validateLayout()
  }, [customLayout, name])

  const validateLayout = () => {
    try {
      const parsedLayout = JSON.parse(customLayout)
      if (!parsedLayout?.areas || !Array.isArray(parsedLayout.areas)) {
        throw new Error("Invalid layout structure")
      }

      setPreviewAreas(parsedLayout.areas)

      // extract unique cell ids
      const cellSet = new Set<string>()
      parsedLayout.areas.forEach((row: string) => {
        row.split(" ").forEach((cell) => cellSet.add(cell))
      })
      setCells(Array.from(cellSet).map((id) => ({ id })))

      if (!name.trim()) {
        setError("Layout name is required")
      } else {
        setError(null)
      }
    } catch {
      setError("Invalid JSON: Please check your input")
      setPreviewAreas([])
      setCells([])
    }
  }

  const handleSave = () => {
    if (error) return

    try {
      const parsedLayout = JSON.parse(customLayout)
      const areasArray = parsedLayout.areas
      const newLayout  = {
        id: layoutToEdit ? layoutToEdit.id : `custom-${Date.now()}`,
        name,
        areas: areasArray.map((row: string) => `"${row}"`).join('\n'),
      }
      //   {
      //     areas: ["cell1 cell2", "cell3 cell2", "cell4 cell4"],
      //   },
      //   null,
      //   2,
      // ),
    // )
    setPreviewAreas([])
    setCells([])
    setError(null)
  }
}
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Custom Layout</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Layout Name</Label>
            <Input id="name" placeholder="Custom Layout" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="custom-layout">Custom Layout JSON</Label>
            <Textarea
              id="custom-layout"
              value={customLayout}
              onChange={(e) => setCustomLayout(e.target.value)}
              rows={10}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Gap ({gap}px)</Label>
            <Slider value={[gap]} onValueChange={(value) => setGap(value[0])} min={0} max={32} step={1} />
          </div>
          <div className="grid gap-2">
            <Label>Layout Preview</Label>
            <div
              className="grid gap-1 p-2 border rounded dark:border-gray-700"
              style={{
                display: "grid",
                gridTemplateAreas: previewAreas.map((row) => `"${row}"`).join(" "),
                gap: `${gap}px`,
              }}
            >
              {cells.map((cell) => (
                <div
                  key={cell.id}
                  className="bg-primary/20 p-2 text-center text-xs dark:bg-primary/40"
                  style={{ gridArea: cell.id }}
                >
                  {cell.id}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted p-4 rounded-md dark:bg-gray-800">
            <h4 className="font-semibold mb-2">Instructions for Custom Layout:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Define the layout grid using the "areas" property.</li>
              <li>Each row should be a separate string in the array.</li>
              <li>Adjust the gap using the slider to set spacing between cells.</li>
              <li>The preview will update as you modify the JSON input.</li>
              <li>Ensure the layout name is filled before adding.</li>
            </ol>
          </div>

          <Button onClick={handleAdd} disabled={!!error}>
            Add Layout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
