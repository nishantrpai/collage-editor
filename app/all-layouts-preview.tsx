"use client";

import { useTheme } from "next-themes";
import { CollageCanvas } from "./collage-canvas";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Eye } from "lucide-react";
import type { Layout, CollageState } from "./types";

interface AllLayoutsPreviewProps {
  layouts: Layout[];
  collageState: CollageState;
  backgroundColor?: string;
  onSelect: (layout: Layout) => void;
  onDeleteLayout?: (layoutId: string) => void;
  onEditLayout?: (layout: Layout) => void;
}

export function AllLayoutsPreview({
  layouts,
  collageState,
  backgroundColor,
  onDeleteLayout,
  onSelect,
  onEditLayout,
}: AllLayoutsPreviewProps) {
  const { theme } = useTheme();
  const bgColor = backgroundColor || (theme === "dark" ? "#000000" : "#ffffff");

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {layouts.map((layout) => (
        <div
          key={layout.id}
          className="aspect-square overflow-hidden rounded border dark:border-gray-800 relative group cursor-pointer"
          onClick={() => onSelect(layout)}
        >
          <CollageCanvas
            layout={layout}
            collageState={collageState}
            isPreview={true}
            backgroundColor={bgColor}
            isFreeFlow={false}
            theme={theme}
          />
        </div>
      ))}
    </div>
  );
}
