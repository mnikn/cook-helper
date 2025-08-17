"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface GalleryItem {
  id: string | number;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface GalleryProps {
  items: GalleryItem[];
  open: boolean;
  onClose: () => void;
  customFooter?: React.ReactNode;
}

export function Gallery({ items, open, onClose, customFooter }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!open) {
      setCurrentIndex(0);
    }
  }, [open]);

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  // if (!items || items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-md:max-w-[90vw] flex flex-col">
        <div
          className="flex flex-col items-center"
        >
          {/* 顶部大图 */}
          <div className="w-full text-center mb-4 mt-6">
            <img
              src={items?.[currentIndex]?.src || ""}
              alt={""}
              className="max-w-full max-h-[400px] rounded-lg shadow-lg object-contain mx-auto"
            />
          </div>
          {/* 底部缩略图预览 */}
          <div
            className="flex gap-2 overflow-x-auto py-2 w-full overflow-x-auto"
          >
            {items?.map((item, idx) => (
              <div
                key={idx}
                className={`cursor-pointer p-0.5 rounded border-2 transition-colors duration-200 shrink-0 ${
                  idx === currentIndex
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent bg-transparent"
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={item.src}
                  alt={""}
                  className={`w-16 h-16 object-cover rounded ${idx === currentIndex ? "opacity-100" : "opacity-70"}`}
                />
              </div>
            ))}
          </div>
          {customFooter}
        </div>
      </DialogContent>
    </Dialog>
  );
}
