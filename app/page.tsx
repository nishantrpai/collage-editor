"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Upload, Save, Download, Move, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CollageCanvas } from "./collage-canvas"
import { LayoutSelector } from "./layout-selector"
import { defaultLayouts } from "./layouts"
import { AddLayoutDialog } from "./add-layout-dialog"
import { ImageControls } from "./image-controls"
import { AllLayoutsPreview } from "./all-layouts-preview"
import { ImageSelector } from "./image-selector"
import { ThemeToggle } from "./theme-toggle"
import type { Layout, CollageState, ImageTransform } from "./types"
import html2canvas from "html2canvas"

const defaultImageTransform: ImageTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1,
}

export default function CollageMaker() {
  const [layouts, setLayouts] = useState<Layout[]>(defaultLayouts)
  const [selectedLayout, setSelectedLayout] = useState<Layout>(layouts[0])
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showAddLayout, setShowAddLayout] = useState(false)
  const [collageState, setCollageState] = useState<CollageState>({
    images: [],
    imageTransforms: {},
    cellImageMap: {},
    cellBackgroundColors: {},
    gridPercentages: {},
    zIndexes: {},
  })
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [isSaving, setIsSaving] = useState(false)
  const [isFreeFlow, setIsFreeFlow] = useState(false)

  useEffect(() => {
    const savedLayouts = localStorage.getItem("customLayouts")
    const savedState = localStorage.getItem("collageState")

    if (savedLayouts) {
      const customLayouts = JSON.parse(savedLayouts)
      setLayouts([...defaultLayouts, ...customLayouts])
    }

    if (savedState) {
      setCollageState(JSON.parse(savedState))
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCollageState((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const canvasElement = document.querySelector(".collage-canvas") as HTMLElement
    if (canvasElement) {
      try {
        const canvas = await html2canvas(canvasElement, {
          scale: 2, // Increase scale for better quality
          useCORS: true,
          width: 1000, // Set fixed width
          height: 1000, // Set fixed height
        })
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `collage-${Date.now()}.png`
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error("Error saving image:", error)
      }
    }
    setIsSaving(false)
  }

  const updateImageTransform = (cellId: string, transform: Partial<ImageTransform>) => {
    setCollageState((prev) => ({
      ...prev,
      imageTransforms: {
        ...prev.imageTransforms,
        [cellId]: {
          ...(prev.imageTransforms[cellId] || defaultImageTransform),
          ...transform,
        },
      },
    }))
  }

  const updateCellBackgroundColor = (cellId: string, color: string) => {
    setCollageState((prev) => ({
      ...prev,
      cellBackgroundColors: {
        ...prev.cellBackgroundColors,
        [cellId]: color,
      },
    }))
  }

  const updateGridPercentage = (
    cellId: string,
    percentage: Partial<{ width: number; height: number; offsetX: number; offsetY: number }>,
  ) => {
    setCollageState((prev) => ({
      ...prev,
      gridPercentages: {
        ...prev.gridPercentages,
        [cellId]: {
          ...(prev.gridPercentages[cellId] || { width: 100, height: 100, offsetX: 0, offsetY: 0 }),
          ...percentage,
        },
      },
    }))
  }

  const updateZIndex = (cellId: string, zIndex: number) => {
    setCollageState((prev) => ({
      ...prev,
      zIndexes: {
        ...prev.zIndexes,
        [cellId]: zIndex,
      },
    }))
  }

  const addCustomLayout = (newLayout: Layout) => {
    const updatedLayouts = [...layouts, newLayout]
    setLayouts(updatedLayouts)
    localStorage.setItem("customLayouts", JSON.stringify(updatedLayouts.filter((l) => l.isCustom)))
  }

  const handleGapChange = (gap: number) => {
    setSelectedLayout((prev) => ({ ...prev, gap }))
  }

  const handleImageSelect = (imageIndex: number) => {
    if (selectedCellId) {
      setCollageState((prev) => ({
        ...prev,
        cellImageMap: {
          ...prev.cellImageMap,
          [selectedCellId]: imageIndex,
        },
      }))
    }
  }

  const handleRemoveImage = (cellId: string) => {
    setCollageState((prev) => {
      const newCellImageMap = { ...prev.cellImageMap }
      delete newCellImageMap[cellId]
      return {
        ...prev,
        cellImageMap: newCellImageMap,
      }
    })
  }

  const handleCellClick = useCallback((cellId: string | null) => {
    setSelectedCellId(cellId)
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-background dark:bg-gray-900">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-card dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 flex justify-between items-center">
            <span className="font-semibold text-foreground dark:text-gray-200">Collage Layouts</span>
            <Button variant="ghost" size="icon" onClick={() => setShowAddLayout(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Separator className="dark:bg-gray-700" />
          <ScrollArea className="h-[calc(100vh-60px)]">
            <Tabs defaultValue="layouts">
              <TabsList className="w-full">
                <TabsTrigger value="layouts" className="flex-1">
                  Layouts
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1">
                  Preview All
                </TabsTrigger>
              </TabsList>
              <TabsContent value="layouts">
                <LayoutSelector
                  layouts={layouts}
                  onSelect={setSelectedLayout}
                  selected={selectedLayout}
                  onGapChange={handleGapChange}
                  onBackgroundColorChange={setBackgroundColor}
                  backgroundColor={backgroundColor}
                />
              </TabsContent>
              <TabsContent value="preview">
                <AllLayoutsPreview layouts={layouts} collageState={collageState} />
              </TabsContent>
            </Tabs>
            <ImageSelector images={collageState.images} onSelect={handleImageSelect} />
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 border-b dark:border-gray-700 flex items-center px-6 py-6 gap-4">
            <ThemeToggle />
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleFileUpload}
            />
            <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
              <Upload className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4" />
            </Button>
            <div className="ml-auto flex items-center gap-4">
              <Move className="w-4 h-4" />
              <div className="w-32">
                <Slider value={[zoom]} onValueChange={(value) => setZoom(value[0])} min={10} max={200} step={1} />
              </div>
              <span className="text-sm">{zoom}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="free-flow"
                checked={isFreeFlow}
                onCheckedChange={(checked) => setIsFreeFlow(checked as boolean)}
              />
              <Label htmlFor="free-flow">Free Flow</Label>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 grid grid-cols-[1fr,300px]">
            <div className="p-8 overflow-auto bg-muted/20 dark:bg-gray-800">
              <div
                className="mx-auto bg-white dark:bg-gray-900 shadow-lg collage-canvas"
                style={{
                  width: 1000,
                  height: 1000,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
              >
                <CollageCanvas
                  layout={selectedLayout}
                  collageState={collageState}
                  onCellSelect={handleCellClick}
                  onRemoveImage={handleRemoveImage}
                  selectedCellId={selectedCellId}
                  isSaving={isSaving}
                  backgroundColor={backgroundColor}
                  isFreeFlow={isFreeFlow}
                />
              </div>
            </div>

            {/* Image Controls Sidebar */}
            {selectedCellId && (
              <div className="border-l p-4 dark:border-gray-700 dark:bg-gray-800">
                <ImageControls
                  transform={collageState.imageTransforms[selectedCellId] || defaultImageTransform}
                  backgroundColor={collageState.cellBackgroundColors[selectedCellId] || "#ffffff"}
                  gridPercentage={
                    collageState.gridPercentages[selectedCellId] || { width: 100, height: 100, offsetX: 0, offsetY: 0 }
                  }
                  zIndex={collageState.zIndexes[selectedCellId] || 0}
                  onChange={(transform) => updateImageTransform(selectedCellId, transform)}
                  onBackgroundColorChange={(color) => updateCellBackgroundColor(selectedCellId, color)}
                  onGridPercentageChange={(percentage) => updateGridPercentage(selectedCellId, percentage)}
                  onZIndexChange={(zIndex) => updateZIndex(selectedCellId, zIndex)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLayoutDialog open={showAddLayout} onOpenChange={setShowAddLayout} onAdd={addCustomLayout} />
    </DndProvider>
  )
}

