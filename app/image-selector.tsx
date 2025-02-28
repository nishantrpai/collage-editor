"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ImageSelectorProps {
  images: string[]
  onSelect: (index: number) => void
  onDelete?: (index: number) => void // Add delete handler
}

export function ImageSelector({ images, onSelect, onDelete }: ImageSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No images available</p>
        <p className="text-sm mt-2">Upload images to add to your collage</p>
      </div>
    )
  }

  const handleSelect = (index: number) => {
    setSelected(index)
    onSelect(index)
  }

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation() // Prevent selection when deleting
    if (onDelete) {
      onDelete(index)
    }
  }

  return (
    <>
      <div className="p-4">
        <h3 className="font-medium mb-3">Available Images</h3>
        <Separator className="mb-4 dark:bg-gray-700" />
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div
                className={cn(
                  "aspect-square rounded border overflow-hidden cursor-pointer hover:border-primary transition-colors dark:border-gray-700",
                  selected === index && "ring-2 ring-primary",
                )}
                onClick={() => handleSelect(index)}
              >
                <img src={image} alt={`Uploaded image ${index}`} className="w-full h-full object-cover" />
              </div>
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(e, index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
