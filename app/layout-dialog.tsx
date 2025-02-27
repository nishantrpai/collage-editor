"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import type { Layout } from "./types"
import { Textarea } from "@/components/ui/textarea"

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
  const [name, setName] = useState("")
  const [areas, setAreas] = useState("")
  const [cells, setCells] = useState<{ id: string }[]>([])
  const [isValidGrid, setIsValidGrid] = useState(false)

  // Reset form when dialog opens/closes or layoutToEdit changes
  useEffect(() => {
    if (layoutToEdit) {
      setName(layoutToEdit.name)
      setAreas(layoutToEdit.areas)
      setCells(layoutToEdit.cells)
      setIsValidGrid(true)
    } else {
      setName("")
      setAreas("")
      setCells([])
      setIsValidGrid(false)
    }
  }, [layoutToEdit, open])

  const validateGrid = (areas: string) => {
    try {
      const rows = areas.split("'").filter((row) => row.trim())
      if (rows.length === 0) return false

      const width = rows[0].trim().split(/\s+/).length
      return rows.every((row) => row.trim().split(/\s+/).length === width)
    } catch {
      return false
    }
  }

  const handleAreasChange = (value: string) => {
    setAreas(value)
    const valid = validateGrid(value)
    setIsValidGrid(valid)
    if (valid) {
      const uniqueCells = Array.from(new Set(value.match(/[a-zA-Z0-9_]+/g)))
      setCells(uniqueCells.map((id) => ({ id })))
    }
  }

  const handleSave = () => {
    if (!isValidGrid) return
    const layout: Layout = {
      id: layoutToEdit?.id || crypto.randomUUID(),
      name,
      areas,
      cells,
      isCustom: true,
    }
    onSave(layout)
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="areas">Grid Areas</Label>
              <Textarea
                id="areas"
                value={areas}
                onChange={(e) => handleAreasChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                <span>Instructions</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use single quotes for each row</li>
                <li>• Separate cells with spaces</li>
                <li>• Use same cell name for spanning</li>
                <li>• Example:</li>
                <li className="font-mono">{'a a b'}</li>
                <li className="font-mono">{'a a c'}</li>
              </ul>
            </div>
          </div>
          <div>
            <Label>Preview</Label>
            <div className="mt-2 border rounded aspect-square p-4 bg-muted/20">
              {isValidGrid && (
                <div
                  className="w-full h-full grid gap-2"
                  style={{
                    gridTemplateAreas: areas,
                  }}
                >
                  {cells.map((cell) => (
                    <div
                      key={cell.id}
                      className="bg-accent dark:bg-gray-700"
                      style={{ gridArea: cell.id }}
                    />
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
          <Button onClick={handleSave} disabled={!isValidGrid || !name}>
            {layoutToEdit ? 'Save Changes' : 'Add Layout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
