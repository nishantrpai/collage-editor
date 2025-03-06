"use client"

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
                  <div
                    key={index}
                    className="aspect-square rounded-md overflow-hidden relative group cursor-pointer border dark:border-gray-800"
                    onClick={() => onSelect(originalIndex)}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-6 h-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(originalIndex)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
                  <div
                    key={index}
                    className="aspect-square rounded-md overflow-hidden relative group cursor-pointer border dark:border-gray-800"
                    onClick={() => onSelect(originalIndex)}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                        ▶
                      </div>
                    </div>
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="w-6 h-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(originalIndex)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
