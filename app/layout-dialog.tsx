"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Textarea } from "@/components/ui/textarea" 
import { Slider } from "@/components/ui/slider"
import type { Layout } from "./types"

interface LayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (layout: Layout) => void
  layoutToEdit?: Layout | null
}

export function LayoutDialog({
  open,
  onOpenChange,
  onSave,
  layoutToEdit
}: LayoutDialogProps) {
  // Default layout if creating a new one
  const defaultAreas = `"a a b"
"a a c"
"d e c"`

  // State
  const [name, setName] = useState("")
  const [areas, setAreas] = useState(defaultAreas)
  const [gap, setGap] = useState(8)
  const [previewAreas, setPreviewAreas] = useState<string>("")
  const [cells, setCells] = useState<{ id: string }[]>([])
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens or layoutToEdit changes
  useEffect(() => {
    if (open) {
      if (layoutToEdit) {
        // Editing an existing layout
        setName(layoutToEdit.name)
        setAreas(layoutToEdit.areas)
        setGap(layoutToEdit.gap || 8)
        setPreviewAreas(layoutToEdit.areas)
        setCells(layoutToEdit.cells)
        setIsValid(true)
        setError(null)
      } else {
        // Creating a new layout
        setName("New Layout")
        setAreas(defaultAreas)
        setGap(8)
        validateGrid(defaultAreas) // Initial validation for default areas
        setError(null)
      }
    }
  }, [open, layoutToEdit])

  // Validate the grid areas format
  const validateGrid = (input: string) => {
    if (!input.trim()) {
      setError("Grid areas cannot be empty")
      setIsValid(false)
      setCells([])
      return false
    }

    try {
      // Remove quotes and trim whitespace
      const rows = input.split('\n')
        .map(row => row.replace(/["']/g, '').trim())
        .filter(row => row.length > 0)

      if (rows.length === 0) {
        setError("Grid must have at least one row")
        setIsValid(false)
        setCells([])
        return false
      }

      // Check that all rows have the same number of cells
      const firstRowCellCount = rows[0].split(/\s+/).length
      const allRowsSameWidth = rows.every(row => row.split(/\s+/).length === firstRowCellCount)

      if (!allRowsSameWidth) {
        setError("All rows must have the same number of columns")
        setIsValid(false)
        setCells([])
        return false
      }

      // Extract unique cell IDs
      const uniqueCells = new Set<string>()
      rows.forEach(row => {
        row.split(/\s+/).forEach(cellId => {
          uniqueCells.add(cellId)
        })
      })

      // Update state with the valid grid
      setPreviewAreas(input)
      setCells(Array.from(uniqueCells).map(id => ({ id })))
      setIsValid(true)
      setError(null)
      return true
    } catch (e) {
      setError("Invalid grid format")
      setIsValid(false)
      setCells([])
      return false
    }
  }

  const handleAreasChange = (value: string) => {
    setAreas(value)
    validateGrid(value)
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!value.trim()) {
      setError("Name is required")
      setIsValid(false)
    } else if (error === "Name is required") {
      if (isValid) {
        setError(null)
      }
    }
  }

  const handleSave = () => {
    if (!isValid || !name.trim()) {
      if (!name.trim()) {
        setError("Name is required")
      }
      return
    }

    const newLayout: Layout = {
      id: layoutToEdit?.id || crypto.randomUUID(),
      name,
      areas,
      cells,
      gap,
      isCustom: true,
    }

    onSave(newLayout)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{layoutToEdit ? 'Edit Layout' : 'Add New Layout'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Layout Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => handleNameChange(e.target.value)} 
                placeholder="My Custom Layout"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="areas">Grid Areas</Label>
              <Textarea
                id="areas"
                value={areas}
                onChange={(e) => handleAreasChange(e.target.value)}
                className="font-mono h-40"
                placeholder={`"a a b"\n"a a c"\n"d e c"`}
              />
            </div>
            <div className="grid gap-2">
              <Label>Gap Size: {gap}px</Label>
              <Slider 
                value={[gap]} 
                onValueChange={value => setGap(value[0])} 
                min={0} 
                max={20} 
                step={1} 
              />
            </div>
            {error && (
              <div className="text-sm text-destructive font-medium mt-2">
                {error}
              </div>
            )}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                <span>Instructions</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use double quotes for each row</li>
                <li>• Separate cells with spaces</li>
                <li>• Use same cell name for spanning</li>
                <li>• Example:</li>
                <li className="font-mono">{"\"a a b\""}</li>
                <li className="font-mono">{"\"a a c\""}</li>
              </ul>
            </div>
          </div>
          <div>
            <Label>Preview</Label>
            <div className="mt-2 border rounded aspect-square p-4 bg-muted/20">
              {isValid && previewAreas && (
                <div
                  className="w-full h-full grid"
                  style={{
                    gridTemplateAreas: previewAreas,
                    gap: `${gap}px`,
                  }}
                >
                  {cells.map((cell) => (
                    <div
                      key={cell.id}
                      className="bg-accent dark:bg-gray-700 flex items-center justify-center text-xs"
                      style={{ gridArea: cell.id }}
                    >
                      {cell.id}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || !name.trim()}>
            {layoutToEdit ? 'Save Changes' : 'Add Layout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
