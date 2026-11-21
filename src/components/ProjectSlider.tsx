import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
      className="w-full h-auto object-contain block"
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
  const trackRef = useRef<HTMLDivElement>(null);
  const hasSeveral = images.length > 1;

  // Native scrolling does the sliding: one slide per screenful, snapping into
  // place. Touch and trackpad swipes work without any script; a click (there
  // is no drag-to-scroll with a mouse) moves to the next slide and wraps.
  const showNext = (): void => {
    const track = trackRef.current;
    if (!track) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div
      ref={trackRef}
      className={`slider-track flex overflow-x-auto snap-x snap-mandatory ${hasSeveral ? 'cursor-pointer' : ''}`}
      role="region"
      aria-label={`${id} project image gallery`}
      onClick={hasSeveral ? showNext : undefined}
    >
      {images.map((image, index) => (
      <div
        className="snap-start shrink-0 w-full flex items-center justify-center"
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
            className="w-full h-auto object-contain block"
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
  );
}