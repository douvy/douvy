import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Pre-load these images at build time
const imageProps = {
  width: 180,
  height: 180,
  priority: true,
  quality: 95
};

// Define all avatar image sources - declared outside component to prevent re-creation
const normalSrc = '/img/milady-no-bg.png';
const blinkSrc = '/img/milady-blink.png'; 
const mouthOpenSrc = '/img/milady-mouth-open.png';
const glassesSrc = '/img/milady-glasses.png';
const glassesBlinkSrc = '/img/milady-glasses-blink.png';

// NEVER touch background image after it loads - it causes glitches
// Create a preloader that tracks image loading status
const preloadImages = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  // Create a promise for each image to track when it's fully loaded
  const imagePromises = [normalSrc, blinkSrc, mouthOpenSrc, glassesSrc, glassesBlinkSrc].map(src => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(`Failed to load ${src}`);
      img.src = src;
    });
  });
  
  return Promise.all(imagePromises);
};

export default function ProfilePicture() {
  const [currentSrc, setCurrentSrc] = useState(normalSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const pfpRef = useRef(null);
  const heroImageRef = useRef(null);
  
  // Animation state maintained in refs to prevent re-renders
  const stateRef = useRef({
    isBlinking: false,
    isMouthMoving: false,
    isSliding: false,
    hasGlasses: false,
    slideCount: 0,
    mouthMoveCount: 0
  });
  
  // First, preload all animation images 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    preloadImages()
      .then(() => {
        setImagesPreloaded(true);
        console.log('All animation images preloaded successfully');
      })
      .catch(err => {
        console.error('Error preloading images:', err);
        // Still set as true so animations can eventually start
        setImagesPreloaded(true);
      });
  }, []);

  // Start animation after everything is fully loaded
  useEffect(() => {
    if (!isLoaded || !imagesPreloaded || animationsStarted) return;
    
    // Add a small delay before starting animations to ensure
    // everything is fully loaded and rendered
    const startupDelay = setTimeout(() => {
      setAnimationsStarted(true);
      
      // Function to update the image source
      function updateImage(newSrc) {
        setCurrentSrc(newSrc);
      }
      
      // Blink function with fixed timing
      function blink() {
        if (stateRef.current.isBlinking || stateRef.current.isSliding) return;
        
        stateRef.current.isBlinking = true;
        
        // Choose the right blink image
        if (stateRef.current.hasGlasses) {
          updateImage(glassesBlinkSrc);
        } else {
          updateImage(blinkSrc);
        }
        
        // Set fixed end time (200ms is good for natural blink)
        setTimeout(() => {
          if (stateRef.current.hasGlasses) {
            updateImage(glassesSrc);
          } else {
            updateImage(normalSrc);
          }
          stateRef.current.isBlinking = false;
        }, 200);
      }
      
      // No need for additional preloading here as we already preloaded everything
      
      function moveMouth() {
        if (stateRef.current.isMouthMoving || stateRef.current.isSliding || stateRef.current.hasGlasses) return;
        
        stateRef.current.isMouthMoving = true;
        stateRef.current.mouthMoveCount++;
        
        updateImage(mouthOpenSrc);
        
        setTimeout(() => {
          updateImage(normalSrc);
          stateRef.current.isMouthMoving = false;
        }, 800);
      }
      
      // Slide animation
      function slideDown() {
        if (stateRef.current.isSliding || !pfpRef.current) return;
        
        stateRef.current.isSliding = true;
        const pfp = pfpRef.current;
        
        // Set proper transitions
        pfp.style.transition = "transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)";
        pfp.style.transform = "translateY(100%)";
        
        setTimeout(() => {
          // Move up out of view
          pfp.style.transition = "none";
          pfp.style.transform = "translateY(-100%)";
          
          stateRef.current.slideCount++;
          if (stateRef.current.slideCount === 1) {
            stateRef.current.hasGlasses = true;
          }
          
          updateImage(glassesSrc);
          
          // Force reflow
          pfp.offsetHeight;
          
          // Bounce back in
          pfp.style.transition = "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
          
          setTimeout(() => {
            pfp.style.transform = "translateY(0)";
            
            setTimeout(() => {
              stateRef.current.isSliding = false;
            }, 700);
          }, 50);
        }, 800);
      }
      
      // Blink immediately on startup
      blink();
      
      // Then set interval for exactly 3.5 seconds
      const blinkInterval = setInterval(blink, 3500);
      
      // Schedule mouth movements with extra delay for first one (giving browser time to settle)
      const firstMouthTimeout = setTimeout(moveMouth, 6000); // Increased from 5000 to 6000
      const secondMouthTimeout = setTimeout(moveMouth, 10000);
      
      // Glasses animation
      const glassesTimeout = setTimeout(() => {
        slideDown();
      }, 15000);
      
      // Cleanup
      return () => {
        clearInterval(blinkInterval);
        clearTimeout(firstMouthTimeout);
        clearTimeout(secondMouthTimeout);
        clearTimeout(glassesTimeout);
      };
    }, 2000); // Extended to 2000ms to ensure everything is fully loaded and browser has time to render
    
    return () => {
      clearTimeout(startupDelay);
    };
  }, [isLoaded, imagesPreloaded, animationsStarted]);

  return (
    <div 
      className="hero-image relative" 
      ref={heroImageRef}
      style={{
        backgroundImage: "url('/img/milady-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div 
        ref={pfpRef}
        id="pfp" 
        className="relative w-[180px] h-[180px] float-right sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]"
        style={{ 
          outline: "none",
          border: "none",
          transform: "translateY(0)" // Ensure starting position is correct
        }}
      >
        <Image 
          src={currentSrc}
          alt="douvy profile" 
          fill
          sizes="(max-width: 768px) 120px, 180px"
          priority={true}
          quality={95}
          onLoadingComplete={() => {
            setIsLoaded(true);
          }}
        />
      </div>
    </div>
  );
}