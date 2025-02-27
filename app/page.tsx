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
import { LayoutDialog } from "./layout-dialog"
import { DeleteLayoutDialog } from "./delete-layout-dialog"
import { ImageControls } from "./image-controls"
import { AllLayoutsPreview } from "./all-layouts-preview"
import { ImageSelector } from "./image-selector"
import { ThemeToggle } from "./theme-toggle"
import type { Layout, CollageState, ImageTransform } from "./types"
import html2canvas from "html2canvas"
import { useTheme } from "next-themes"

const defaultImageTransform: ImageTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1,
  borderRadius: 0,
}

export default function CollageMaker() {
  const [layouts, setLayouts] = useState<Layout[]>(defaultLayouts)
  const [selectedLayout, setSelectedLayout] = useState<Layout>(layouts[0])
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showAddLayout, setShowAddLayout] = useState(false)
  const [layoutToEdit, setLayoutToEdit] = useState<Layout | null>(null)
  const [deleteLayoutId, setDeleteLayoutId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [layoutToDelete, setLayoutToDelete] = useState<Layout | null>(null)
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
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 1000 })
  const [isPanning, setIsPanning] = useState(false)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)

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

  useEffect(() => {
    // Find the layout to delete when deleteLayoutId changes
    if (deleteLayoutId) {
      const layout = layouts.find(l => l.id === deleteLayoutId);
      if (layout && layout.isCustom) {
        setLayoutToDelete(layout);
        setShowDeleteDialog(true);
      }
    }
  }, [deleteLayoutId, layouts]);

  useEffect(() => {
    setMounted(true)
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
          scale: 4, // Higher scale for better quality
          useCORS: true,
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
          width: 8000,
          height: 8000,
        })
        const dataUrl = canvas.toDataURL("image/png", 1.0) // Maximum quality
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

  const handleDeleteLayout = (layoutId: string) => {
    setDeleteLayoutId(layoutId);
  }

  const confirmDeleteLayout = () => {
    if (deleteLayoutId) {
      // Filter out the layout to delete
      const updatedLayouts = layouts.filter(layout => layout.id !== deleteLayoutId);
      setLayouts(updatedLayouts);

      // If the currently selected layout is being deleted, select the first available layout
      if (selectedLayout.id === deleteLayoutId) {
        setSelectedLayout(updatedLayouts[0]);
      }

      // Update localStorage with the new custom layouts
      localStorage.setItem("customLayouts", JSON.stringify(updatedLayouts.filter(l => l.isCustom)));

      // Reset state
      setDeleteLayoutId(null);
      setLayoutToDelete(null);
      setShowDeleteDialog(false);
    }
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

  // Remove the handleOutsideClick implementation that unselects cells
  const handleOutsideClick = (e: React.MouseEvent) => {
    // We're removing the auto-unselect behavior
    // The cell will now only be unselected by clicking the "Done" button
  }

  // Add handler to explicitly unselect cell
  const handleDoneEditing = useCallback(() => {
    setSelectedCellId(null);
  }, []);

  const handleEditLayout = (layout: Layout) => {
    setLayoutToEdit(layout);
    setShowAddLayout(true);
  }

  const addOrUpdateLayout = (newLayout: Layout) => {
    if (layouts.some(l => l.id === newLayout.id)) {
      // Update existing layout
      const updatedLayouts = layouts.map(l => 
        l.id === newLayout.id ? newLayout : l
      );
      setLayouts(updatedLayouts);
      
      // If we're editing the currently selected layout, update it
      if (selectedLayout.id === newLayout.id) {
        setSelectedLayout(newLayout);
      }
      
      // Save to localStorage
      localStorage.setItem("customLayouts", JSON.stringify(updatedLayouts.filter(l => l.isCustom)));
    } else {
      // Add new layout
      const updatedLayouts = [...layouts, newLayout];
      setLayouts(updatedLayouts);
      localStorage.setItem("customLayouts", JSON.stringify(updatedLayouts.filter(l => l.isCustom)));
    }
    
    // Reset edit state
    setLayoutToEdit(null);
  }

  const handlePanStart = (e: React.MouseEvent) => {
    if (isPanning) {
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
    }
  }

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && dragStart) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setCanvasOffset({ x: newX, y: newY })
    }
  }

  const handlePanEnd = () => {
    setDragStart(null)
  }

  const { theme, resolvedTheme } = useTheme()

  // Don't render until mounted to prevent theme mismatch
  if (!mounted) {
    return null
  }

  // Use resolvedTheme instead of theme for more reliable detection
  const currentTheme = resolvedTheme || 'light'

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-background dark:bg-black" onClick={handleOutsideClick}>
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-card dark:bg-black dark:border-gray-800">
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
                  onDeleteLayout={handleDeleteLayout}
                  onEditLayout={handleEditLayout}
                />
              </TabsContent>
              <TabsContent value="preview">
                <AllLayoutsPreview 
                  layouts={layouts} 
                  collageState={collageState} 
                  backgroundColor={backgroundColor}
                  onDeleteLayout={handleDeleteLayout}
                  onEditLayout={handleEditLayout}
                />
              </TabsContent>
            </Tabs>
            <ImageSelector images={collageState.images} onSelect={handleImageSelect} />
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 border-b dark:border-gray-800 flex items-center px-6 py-6 gap-4">
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
              <Button
                variant={isPanning ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setIsPanning(!isPanning)}
                className={isPanning ? "bg-accent" : ""}
              >
                <Move className="w-4 h-4" />
              </Button>
              <div className="w-32">
                <Slider value={[zoom]} onValueChange={(value) => setZoom(value[0])} min={10} max={200} step={1} />
              </div>
              <span className="text-sm">{zoom}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Label>Canvas:</Label>
              <div className="w-32">
                <Slider 
                  value={[canvasSize.width]} 
                  onValueChange={(value) => setCanvasSize(prev => ({ ...prev, width: value[0] }))} 
                  min={500} 
                  max={8000} 
                  step={100} 
                />
              </div>
              <span className="text-sm">{canvasSize.width}px</span>
              <div className="w-32">
                <Slider 
                  value={[canvasSize.height]} 
                  onValueChange={(value) => setCanvasSize(prev => ({ ...prev, height: value[0] }))} 
                  min={500} 
                  max={8000} 
                  step={100} 
                />
              </div>
              <span className="text-sm">{canvasSize.height}px</span>
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
            <div 
              className="p-8 overflow-hidden bg-muted/20 dark:bg-black"
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              style={{ cursor: isPanning ? 'grab' : 'default',
                  backgroundImage: `
                    linear-gradient(to right, ${theme == 'dark' ? '#111' : '#eee'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${theme == 'dark' ? '#111' : '#eee'} 1px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
               }}
            >
              <div 
                className="collage-canvas-wrapper mx-auto"
                style={{
                  transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                  transition: isPanning ? 'none' : 'transform 0.2s',
                }}
              >
                <div
                  className="mx-auto shadow-lg collage-canvas"
                  style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                    backgroundColor: backgroundColor, // Use backgroundColor directly
                  }}
                >
                  <CollageCanvas
                    layout={selectedLayout}
                    collageState={collageState}
                    onCellSelect={handleCellClick}
                    onRemoveImage={handleRemoveImage}
                    selectedCellId={selectedCellId}
                    isSaving={isSaving}
                    backgroundColor={backgroundColor} // Use backgroundColor directly
                    isFreeFlow={isFreeFlow}
                    theme={currentTheme}
                  />
                </div>
              </div>
            </div>

            {/* Image Controls Sidebar */}
            {selectedCellId && (
              <div className="border-l p-4 dark:border-gray-800 dark:bg-black">
                <ImageControls
                  transform={collageState.imageTransforms[selectedCellId] || defaultImageTransform}
                  backgroundColor={collageState.cellBackgroundColors[selectedCellId] || backgroundColor}
                  gridPercentage={
                    collageState.gridPercentages[selectedCellId] || { width: 100, height: 100, offsetX: 0, offsetY: 0 }
                  }
                  zIndex={collageState.zIndexes[selectedCellId] || 0}
                  onChange={(transform) => updateImageTransform(selectedCellId, transform)}
                  onBackgroundColorChange={(color) => updateCellBackgroundColor(selectedCellId, color)}
                  onGridPercentageChange={(percentage) => updateGridPercentage(selectedCellId, percentage)}
                  onZIndexChange={(zIndex) => updateZIndex(selectedCellId, zIndex)}
                  onDone={handleDoneEditing}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <LayoutDialog 
        open={showAddLayout} 
        onOpenChange={setShowAddLayout} 
        onSave={addOrUpdateLayout} 
        layoutToEdit={layoutToEdit} 
      />
      {layoutToDelete && (
        <DeleteLayoutDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog} 
          onConfirm={confirmDeleteLayout} 
          layoutName={layoutToDelete.name} 
        />
      )}
    </DndProvider>
  )
}
