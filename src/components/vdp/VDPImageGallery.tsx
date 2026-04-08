"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export default function VDPImageGallery({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Sync state with carousel
  useCallback(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  return (
    <div className="flex flex-col mb-8">
      {/* Main Image Viewport constraints for Edge-to-Edge look */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.35/1] bg-gray-900 overflow-hidden mx-auto">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 h-full relative">
                <img 
                  src={src} 
                  alt={`Vehicle Image ${idx + 1}`} 
                  className="absolute block w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel controls */}
        <button 
          onClick={scrollPrev} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={scrollNext} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Photo Count */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {selectedIndex + 1} / {images.length} Photos
        </div>
      </div>

      {/* Thumbnails (CSS Grid based on items) */}
      <div className="flex gap-2 p-2 mx-auto overflow-x-auto w-full max-w-7xl no-scrollbar mt-2">
        {images.map((src, idx) => (
          <button 
            key={idx} 
            onClick={() => emblaApi && emblaApi.scrollTo(idx)}
            className={`flex-shrink-0 relative w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
              idx === selectedIndex ? "border-[var(--color-shelby-red)] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={src} className="w-full h-full object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  );
}
