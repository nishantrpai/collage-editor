"use client"

import { useRef } from "react"
import { useDrag } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MediaItem } from "./types"

interface ImageSelectorProps {
  media: MediaItem[]
  onSelect: (index: number) => void
  onDelete?: (index: number) => void
}

interface DraggableMediaItemProps {
  mediaIndex: number
  children: React.ReactNode
  onClick: () => void
  onDelete?: () => void
}

function DraggableMediaItem({ mediaIndex, children, onClick, onDelete }: DraggableMediaItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "MEDIA",
      item: { index: mediaIndex },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [mediaIndex]
  )

  drag(ref)

  return (
    <div
      ref={ref}
      className="aspect-square rounded-md overflow-hidden relative group cursor-grab border dark:border-gray-800"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={onClick}
    >
      {children}
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="w-6 h-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export function ImageSelector({ media, onSelect, onDelete }: ImageSelectorProps) {
  // Filter media by type
  const images = media.filter(item => item.type === 'image')
  const videos = media.filter(item => item.type === 'video')
  
  // Find original indices
  const getOriginalIndex = (filteredIndex: number, type: 'image' | 'video'): number => {
    let count = 0
    for (let i = 0; i < media.length; i++) {
      if (media[i].type === type) {
        if (count === filteredIndex) return i
        count++
      }
    }
    return -1
  }

  return (
    <div className="p-4">
      <h3 className="mb-2 font-medium text-sm">Media Library</h3>
      <Tabs defaultValue="images">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="images" className="flex-1">Images ({images.length})</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">Videos ({videos.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images">
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => {
                const originalIndex = getOriginalIndex(index, 'image')
                return (
                  <DraggableMediaItem
                    key={index}
                    mediaIndex={originalIndex}
                    onClick={() => onSelect(originalIndex)}
                    onDelete={onDelete ? () => onDelete(originalIndex) : undefined}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </DraggableMediaItem>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="videos">
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-2 gap-2">
              {videos.map((video, index) => {
                const originalIndex = getOriginalIndex(index, 'video')
                return (
                  <DraggableMediaItem
                    key={index}
                    mediaIndex={originalIndex}
                    onClick={() => onSelect(originalIndex)}
                    onDelete={onDelete ? () => onDelete(originalIndex) : undefined}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                      draggable={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                        ▶
                      </div>
                    </div>
                  </DraggableMediaItem>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
