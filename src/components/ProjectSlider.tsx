import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
// Import Swiper styles
import 'swiper/css';
import type Swiper from 'swiper';
import { ProjectImage } from '@/types';

interface ProjectSliderProps {
  images: ProjectImage[];
  id: string;
}

interface LazyVideoProps {
  src: string;
  id: string;
  label: string;
  width?: number;
  height?: number;
}

// Autoplaying video that only starts downloading once its card is close to
// the viewport, so visitors who never scroll that far don't pay for it.
function LazyVideo({ src, id, label, width, height }: LazyVideoProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' } // start early enough to be playing on arrival
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={isNear ? src : undefined}
      id={id}
      aria-label={label}
      className="w-full h-auto object-contain block cursor-pointer"
      // width/height reserve the right aspect ratio before the file loads
      width={width}
      height={height}
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
  );
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
            loop: images.length > 1, // looping a single slide only logs a warning
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
              <LazyVideo
                src={image.src}
                id={image.id || `${id}-${index}`}
                label={image.alt || `${id} project video ${index + 1}`}
                width={image.width}
                height={image.height}
              />
            ) : (
              <Image
                src={image.src}
                id={image.id || `${id}-${index}`}
                alt={image.alt || `${id} project image ${index + 1}`}
                className="w-full h-auto object-contain block cursor-pointer"
                width={450}
                height={280}
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