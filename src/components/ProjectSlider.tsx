import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
// Import Swiper styles
import 'swiper/css';
import type Swiper from 'swiper';
import { ProjectImage } from '@/types';

interface ProjectSliderProps {
  images: ProjectImage[];
  id: string;
}

export default function ProjectSlider({ images, id }: ProjectSliderProps): React.ReactElement {
  const swiperElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Import Swiper dynamically to avoid SSR issues
    const loadSwiper = async (): Promise<(() => void) | undefined> => {
      if (typeof window !== 'undefined') {
        try {
          const swiperModule = await import('swiper');
          const SwiperClass = swiperModule.default || swiperModule.Swiper;
          
          // Initialize swiper with more configuration options
          if (!swiperElRef.current) return undefined;
          
          const swiper = new SwiperClass(swiperElRef.current, {
            direction: 'horizontal',
            loop: true,
            grabCursor: true,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: false,     // Since images are now the same height
            updateOnWindowResize: true,
            watchSlidesProgress: true,
            observer: true,
            observeParents: true
          });
          
          return () => {
            swiper.destroy();
          };
        } catch (error) {
          console.error('Error loading Swiper:', error);
          return undefined;
        }
      }
      return undefined;
    };
    
    const cleanupFn = loadSwiper();
    
    return () => {
      cleanupFn?.then(cleanup => cleanup?.());
    };
  }, []);

  return (
    <div 
      className="swiper-container cursor-pointer" 
      ref={swiperElRef}
      role="region"
      aria-label={`${id} project image gallery`}
    >
      <div className="swiper-wrapper">
        {images.map((image, index) => (
          <div 
            className="swiper-slide flex items-center justify-center cursor-pointer" 
            key={index}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${images.length}`}
          >
            {image.src.endsWith('.mp4') ? (
              <video
                src={image.src}
                id={image.id || `${id}-${index}`}
                aria-label={image.alt || `${id} project video ${index + 1}`}
                className="w-full h-auto object-contain block cursor-pointer"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "auto",
                  margin: 0,
                  padding: 0,
                  display: "block"
                }}
              />
            ) : (
              <Image
                src={image.src}
                id={image.id || `${id}-${index}`}
                alt={image.alt || `${id} project image ${index + 1}`}
                className="w-full h-auto object-contain block cursor-pointer"
                width={450}
                height={280}
                priority={index === 0} // Only prioritize first image in each slider
                quality={90}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "auto",
                  margin: 0,
                  padding: 0,
                  display: "block"
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}