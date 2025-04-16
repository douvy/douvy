import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';

// Define all avatar image sources - declared outside component to prevent re-creation
const normalSrc = '/img/milady-no-bg.png';
const blinkSrc = '/img/milady-blink.png'; 
const mouthOpenSrc = '/img/milady-mouth-open.png';
const glassesSrc = '/img/milady-glasses.png';
const glassesBlinkSrc = '/img/milady-glasses-blink.png';

// NEVER touch background image after it loads - it causes glitches
// Just preload avatar images for animation
if (typeof window !== 'undefined') {
  [normalSrc, blinkSrc, mouthOpenSrc, glassesSrc, glassesBlinkSrc].forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

export default function ProfilePicture() {
  const [currentSrc, setCurrentSrc] = useState(normalSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);
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
  
  // Start animation after everything is fully loaded
  useEffect(() => {
    if (!isLoaded || animationsStarted) return;
    
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
      
      // Mouth movement animation
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
      
      // Schedule mouth movements
      const firstMouthTimeout = setTimeout(() => {
        moveMouth();
      }, 5000);
      
      const secondMouthTimeout = setTimeout(() => {
        moveMouth();
      }, 10000);
      
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
    }, 500); // Shorter initial delay so first blink happens quickly
    
    return () => {
      clearTimeout(startupDelay);
    };
  }, [isLoaded, animationsStarted]);

  return (
    <div 
      className="hero-image relative" 
      ref={heroImageRef}
      style={{
        // NEVER CHANGE THIS - Fixed background that never gets touched during animations
        backgroundImage: "url('/img/milady-bg.jpg')",
        backgroundColor: "#0B1119",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div 
        ref={pfpRef}
        id="pfp" 
        className="relative w-[180px] h-[180px] float-right sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]"
        style={{ 
          outline: "none",
          border: "none",
          // Add transform property here to prevent layout shifts
          transform: "translateY(0)"
        }}
      >
        {/* Use onLoadingComplete to ensure we start animations after images are ready */}
        <NextImage 
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