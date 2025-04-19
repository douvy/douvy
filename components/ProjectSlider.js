import { useEffect, useRef } from 'react';
import Image from 'next/image';
// Import Swiper styles
import 'swiper/css';

export default function ProjectSlider({ images, id }) {
  const swiperElRef = useRef(null);

  useEffect(() => {
    // Import Swiper dynamically to avoid SSR issues
    const loadSwiper = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { Swiper } = await import('swiper');
          
          // Initialize swiper with more configuration options
          const swiper = new Swiper(swiperElRef.current, {
            direction: 'horizontal',
            loop: true,
            grabCursor: true,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: true,      // Dynamically adjust height
            updateOnImagesReady: true, // Update layout when images are loaded
          });
          
          return () => {
            swiper.destroy();
          };
        } catch (error) {
          console.error('Error loading Swiper:', error);
        }
      }
    };
    
    loadSwiper();
  }, []);

  return (
    <div className="swiper-container" ref={swiperElRef}>
      <div className="swiper-wrapper">
        {images.map((image, index) => (
          <div className="swiper-slide" key={index}>
            <Image 
              src={image.src} 
              id={image.id || `${id}-${index}`}
              alt={image.alt || `Project Image ${index + 1}`}
              className="w-full h-auto object-contain"
              width={450}
              height={280}
              layout="responsive"
              priority={index === 0} // Only prioritize first image in each slider
              quality={90}
              style={{
                objectFit: "contain", 
                width: "100%", 
                height: "auto",
                marginRight: 0,
                paddingRight: 0
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}