"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Upload, Save, Download, Move, Plus, Eye, EyeOff, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Canvas dimension presets
const CANVAS_PRESETS = [
  { name: "Custom", width: 1000, height: 1000 },
  { name: "Square", width: 1080, height: 1080 },
  { name: "Golden", width: 1618, height: 1000 },
  { name: "2x2.5", width: 2000, height: 2500 },
  { name: "3x5", width: 3000, height: 5000 },
  { name: "4x6", width: 4000, height: 6000 },
  { name: "5x7", width: 5000, height: 7000 },
  { name: "8x10", width: 8000, height: 10000 },
  { name: "11x14", width: 11000, height: 14000 },
  { name: "16x9", width: 1600, height: 900 },
  { name: "1640x624", width: 1640, height: 624 },
  { name: "800x600", width: 800, height: 600 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1280x1024", width: 1280, height: 1024 },
  { name: "640x960", width: 640, height: 960 },
  { name: "640x1136", width: 640, height: 1136 },
  { name: "2048x1536", width: 2048, height: 1536 },
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "2560x1600", width: 2560, height: 1600 }
]

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
    media: [],
    imageTransforms: {},
    cellMediaMap: {},
    cellBackgroundColors: {},
    gridPercentages: {},
    zIndexes: {},
  })
  const { theme, resolvedTheme } = useTheme()
  const [backgroundColor, setBackgroundColor] = useState('#fff')
  const [isSaving, setIsSaving] = useState(false)
  const [isFreeFlow, setIsFreeFlow] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 1000 })
  const [isPanning, setIsPanning] = useState(false)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [canvasPreset, setCanvasPreset] = useState<string>("Custom")
  const [canvasDimension, setCanvasDimension] = useState({ width: "1000", height: "1000" })
  const [showLayoutPreview, setShowLayoutPreview] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

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

  // Handle resize to keep canvas centered
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          setCollageState((prev) => ({
            ...prev,
            media: [
              ...prev.media,
              {
                type: file.type.startsWith("image/") ? "image" : "video",
                url: result
              }
            ],
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Check if we have any videos in the collage
      const hasVideos = Object.values(collageState.cellMediaMap).some(mediaIndex => {
        const media = collageState.media[mediaIndex]
        return media && media.type === 'video'
      })

      // If we have videos, use a different approach
      if (hasVideos) {
        await saveAsVideo()
      } else {
        await saveAsImage()
      }
    } catch (error) {
      console.error("Error saving:", error)
    }
    
    setIsSaving(false)
  }

  const saveAsImage = async () => {
    // Existing image save logic
    const canvasElement = document.querySelector(".collage-canvas") as HTMLElement
      
    if (!canvasElement) {
      console.error("Could not find collage canvas element")
      return
    }
    
    // Create a wrapper with the exact dimensions and styling
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    wrapper.style.top = '-9999px'
    document.body.appendChild(wrapper)
    
    // Clone the canvas for capture
    const clone = canvasElement.cloneNode(true) as HTMLElement
    clone.style.transform = 'none' // Remove any scaling
    clone.style.width = `${canvasSize.width}px`
    clone.style.height = `${canvasSize.height}px`
    
    wrapper.appendChild(clone)
    
    // Use html2canvas with improved settings
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher value for better quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true, // Allow non-CORS images
      backgroundColor: backgroundColor,
      width: canvasSize.width,
      height: canvasSize.height,
      logging: false, // Disable logging
      imageTimeout: 0, // No timeout for images
      onclone: (clonedDoc) => {
        // Any post-clone manipulations can be done here
        const clonedCanvas = clonedDoc.querySelector('.collage-canvas')
        if (clonedCanvas instanceof HTMLElement) {
          // Make sure it has the right dimensions
          clonedCanvas.style.width = `${canvasSize.width}px`
          clonedCanvas.style.height = `${canvasSize.height}px`
        }
      }
    })
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `collage-${Date.now()}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }
    }, 'image/png', 1.0) // Best quality PNG
    
    // Clean up the clone
    document.body.removeChild(wrapper)
  }

  const saveAsVideo = async () => {
    // Notify user we're preparing the video
    alert("Preparing video download. This may take a moment...")
    
    try {
      // We'll need to use a canvas-based video recording approach
      const canvasElement = document.querySelector(".collage-canvas") as HTMLElement
      if (!canvasElement) {
        throw new Error("Could not find canvas element")
      }
      
      // Create a canvas for recording
      const canvas = document.createElement('canvas')
      canvas.width = canvasSize.width
      canvas.height = canvasSize.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }
      
      // Create a stream from the canvas
      const stream = canvas.captureStream(60) // 30 FPS
      
      // Create recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 5 Mbps
      })
      
      const chunks: Blob[] = []
      recorder.ondataavailable = e => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `collage-video-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
      }
      
      // Start recording
      recorder.start()
      
      // Record for 5 seconds
      const duration = 5000
      const startTime = performance.now()
      
      // Animation frame drawing function
      const draw = () => {
        // Fill background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Render the canvas content using html2canvas once per frame
        html2canvas(canvasElement, {
          backgroundColor: backgroundColor,
          width: canvasSize.width,
          height: canvasSize.height,
          scale: 1,
          useCORS: true,
          allowTaint: true,
        }).then(renderedCanvas => {
          ctx.drawImage(renderedCanvas, 0, 0, canvas.width, canvas.height)
          
          const elapsed = performance.now() - startTime
          if (elapsed < duration) {
            requestAnimationFrame(draw)
          } else {
            // Stop recording after duration
            recorder.stop()
          }
        })
      }
      
      draw()
    } catch (error) {
      console.error("Error saving video:", error)
      alert("There was an error creating the video. Please try again.")
    }
  }

  // Updated helper function to include gap calculations
  const getCellRect = (
    cellId: string, 
    layout: Layout, 
    canvasWidth: number, 
    canvasHeight: number,
    gapSize: number
  ) => {
    // Parse grid template areas to find cell position and size
    const rows = layout.areas.split('\n').map(row => 
      row.replace(/['"]/g, '').trim().split(/\s+/)
    )
    
    const gridWidth = rows[0].length
    const gridHeight = rows.length

    // Find cell boundaries
    let startRow = -1, endRow = -1, startCol = -1, endCol = -1
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === cellId) {
          if (startRow === -1) {
            startRow = rowIndex
            startCol = colIndex
          }
          endRow = rowIndex
          endCol = colIndex
        }
      })
    })

    if (startRow === -1) return null

    // Calculate available space after gaps
    const totalGapWidth = (gridWidth - 1) * gapSize
    const totalGapHeight = (gridHeight - 1) * gapSize
    const availableWidth = canvasWidth - totalGapWidth
    const availableHeight = canvasHeight - totalGapHeight

    // Calculate cell dimensions including gaps
    const cellWidth = availableWidth / gridWidth
    const cellHeight = availableHeight / gridHeight
    
    // Calculate position including gaps
    const x = startCol * (cellWidth + gapSize)
    const y = startRow * (cellHeight + gapSize)
    
    // Calculate total size including spanning
    const width = (endCol - startCol + 1) * cellWidth + (endCol - startCol) * gapSize
    const height = (endRow - startRow + 1) * cellHeight + (endRow - startRow) * gapSize

    return { x, y, width, height }
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

  const handleMediaSelect = (mediaIndex: number) => {
    if (selectedCellId) {
      setCollageState((prev) => ({
        ...prev,
        cellMediaMap: {
          ...prev.cellMediaMap,
          [selectedCellId]: mediaIndex,
        },
      }))
    }
  }

  const handleRemoveMedia = (cellId: string) => {
    setCollageState((prev) => {
      const newCellMediaMap = { ...prev.cellMediaMap }
      delete newCellMediaMap[cellId]
      return {
        ...prev,
        cellMediaMap: newCellMediaMap,
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

  const handleCanvasDimensionChange = (dimension: "width" | "height", value: string) => {
    setCanvasDimension(prev => ({
      ...prev,
      [dimension]: value
    }))

    // Only update actual canvas size when input is valid
    if (!isNaN(parseInt(value)) && parseInt(value) > 0) {
      setCanvasSize(prev => ({
        ...prev,
        [dimension]: parseInt(value)
      }))
      setCanvasPreset("Custom") // Reset to Custom when manually changing dimensions
    }
  }

  const handleCanvasPresetChange = (presetName: string) => {
    const preset = CANVAS_PRESETS.find(p => p.name === presetName)
    if (preset) {
      setCanvasPreset(presetName)
      setCanvasSize({ width: preset.width, height: preset.height })
      setCanvasDimension({ 
        width: preset.width.toString(), 
        height: preset.height.toString() 
      })
    }
  }

  const toggleLayoutPreview = () => {
    setShowLayoutPreview(!showLayoutPreview)
  }

  const handleLayoutSelect = (layout: Layout) => {
    setSelectedLayout(layout)
    // You can optionally close the preview after selecting
    // setShowLayoutPreview(false)
  }

  // Add a function to handle image deletion
  const handleDeleteMedia = (mediaIndex: number) => {
    // Create a new array without the deleted media item
    const newMedia = [...collageState.media]
    newMedia.splice(mediaIndex, 1)
    
    // Remove references to this media from cell mappings
    const newCellMediaMap = { ...collageState.cellMediaMap }
    
    // For each cell that had this media or a media with a higher index
    Object.keys(newCellMediaMap).forEach((cellId) => {
      if (newCellMediaMap[cellId] === mediaIndex) {
        // Remove the mapping for cells that had this media
        delete newCellMediaMap[cellId]
      } else if (newCellMediaMap[cellId] > mediaIndex) {
        // Decrement the index for cells that had media with higher indices
        newCellMediaMap[cellId] = newCellMediaMap[cellId] - 1
      }
    })
    
    // Update the collage state
    setCollageState((prev) => ({
      ...prev,
      media: newMedia,
      cellMediaMap: newCellMediaMap,
    }))
  }

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
            <span className="font-semibold text-foreground dark:text-gray-200">Montage</span>
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
                  onSelect={setSelectedLayout}
                />
              </TabsContent>
            </Tabs>
            <ImageSelector 
              media={collageState.media}
              onSelect={handleMediaSelect}
              onDelete={handleDeleteMedia}
            />
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
              accept="image/*,video/*"
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
            <Button variant="outline" onClick={toggleLayoutPreview}>
              {showLayoutPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <Label className="mr-2">Canvas:</Label>
              
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 font-normal">
                {canvasPreset} <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Canvas Size Presets</DropdownMenuLabel>
                {CANVAS_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.name}
                  onClick={() => handleCanvasPresetChange(preset.name)}
                  className={canvasPreset === preset.name ? "bg-accent" : ""}
                >
                  {preset.name} ({preset.width}×{preset.height})
                </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex items-center gap-2">
              <Input
                className="w-20 h-8 text-right"
                value={canvasDimension.width}
                onChange={(e) => handleCanvasDimensionChange("width", e.target.value)}
                onBlur={() => {
                if (canvasDimension.width === "" || parseInt(canvasDimension.width) <= 0) {
                  setCanvasDimension(prev => ({ ...prev, width: canvasSize.width.toString() }))
                }
                }}
              />
              <span>×</span>
              <Input
                className="w-20 h-8 text-right"
                value={canvasDimension.height}
                onChange={(e) => handleCanvasDimensionChange("height", e.target.value)}
                onBlur={() => {
                if (canvasDimension.height === "" || parseInt(canvasDimension.height) <= 0) {
                  setCanvasDimension(prev => ({ ...prev, height: canvasSize.height.toString() }))
                }
                }}
              />
              </div>
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
              ref={containerRef}
              className="p-8 overflow-hidden bg-muted/20 dark:bg-black"
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              style={{ cursor: isPanning ? 'grab' : 'default',
                  backgroundImage: `
                    linear-gradient(to right, ${currentTheme == 'dark' ? '#111' : '#eee'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${currentTheme == 'dark' ? '#111' : '#eee'} 1px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
              }}
            >
              <div 
                className="collage-canvas-wrapper mx-auto"
                style={{
                  transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                  transition: isPanning ? 'none' : 'transform 0.2s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <div
                  className="mx-auto shadow-lg collage-canvas"
                  style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "center center", // Change to center center for better centering
                    backgroundColor: backgroundColor,
                  }}
                >
                  {showLayoutPreview ? (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                      <h3 className="text-lg font-bold mb-4">Layout Preview</h3>
                      <div className="grid grid-cols-3 gap-4 max-w-3xl">
                        {layouts.map((layout) => (
                          <div 
                            key={layout.id} 
                            className={`aspect-square border rounded cursor-pointer ${
                              selectedLayout.id === layout.id ? "border-primary border-2" : "border-border"
                            }`}
                            onClick={() => handleLayoutSelect(layout)}
                          >
                            <div
                              className="w-full h-full grid"
                              style={{
                                gridTemplateAreas: layout.areas,
                                gap: `${layout.gap || 8}px`,
                              }}
                            >
                              {layout.cells.map((cell, i) => (
                                <div
                                  key={i}
                                  className="bg-accent/50 dark:bg-accent/30"
                                  style={{ gridArea: cell.id }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="mt-4" 
                        onClick={toggleLayoutPreview}
                        variant="secondary"
                      >
                        Return to Editor
                      </Button>
                    </div>
                  ) : (
                    <CollageCanvas
                      layout={selectedLayout}
                      collageState={collageState}
                      onCellSelect={handleCellClick}
                      onRemoveMedia={handleRemoveMedia}
                      selectedCellId={selectedCellId}
                      isSaving={isSaving}
                      backgroundColor={backgroundColor}
                      isFreeFlow={isFreeFlow}
                      theme={currentTheme}
                    />
                  )}
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
