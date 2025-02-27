import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface ImageSelectorProps {
  images: string[]
  onSelect: (imageIndex: number) => void
}

export function ImageSelector({ images, onSelect }: ImageSelectorProps) {
  return (
    <div className="p-4 border-t">
      <h3 className="font-semibold mb-2">Available Images</h3>
      <ScrollArea className="h-40">
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <Button key={index} variant="outline" className="p-1" onClick={() => onSelect(index)}>
              <Image
                src={image || "/placeholder.svg"}
                alt={`Image ${index + 1}`}
                width={50}
                height={50}
                className="object-cover"
              />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

