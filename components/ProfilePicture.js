import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';

// Pre-load these images at build time
const imageProps = {
  width: 180,
  height: 180,
  priority: true,
  quality: 95
};

// Define all avatar image sources
const normalSrc = '/img/milady-no-bg.png';
const blinkSrc = '/img/milady-blink.png'; 
const mouthOpenSrc = '/img/milady-mouth-open.png';
const glassesSrc = '/img/milady-glasses.png';
const glassesBlinkSrc = '/img/milady-glasses-blink.png';

export default function ProfilePicture() {
  const [isClient, setIsClient] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(normalSrc);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [readyForAnimation, setReadyForAnimation] = useState(false);
  const pfpRef = useRef(null);
  const heroImageRef = useRef(null);
  const imageLoadedCount = useRef(0);
  
  // Preload all images manually before starting animations
  useEffect(() => {
    const imagesToPreload = [
      normalSrc,
      blinkSrc,
      mouthOpenSrc,
      glassesSrc,
      glassesBlinkSrc,
      '/img/milady-bg.jpg'
    ];
    
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Create a promise for each image to load
      const imagePromises = imagesToPreload.map(src => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            imageLoadedCount.current += 1;
            resolve();
          };
          img.onerror = () => {
            // Even if it fails, we'll continue
            imageLoadedCount.current += 1;
            resolve();
          };
          img.src = src;
        });
      });
      
      // When all images are loaded, set imagesLoaded to true
      Promise.all(imagePromises)
        .then(() => {
          setImagesLoaded(true);
          // Add additional delay for mobile
          const isMobile = window.innerWidth <= 768;
          setTimeout(() => {
            setReadyForAnimation(true);
          }, isMobile ? 1000 : 300);
        });
    }
  }, []);

  // Start animation only after images are loaded and we're ready
  useEffect(() => {
    // Don't start animations until all images are loaded, we're ready, and the component is mounted
    if (!isClient || !imagesLoaded || !readyForAnimation || !pfpRef.current) return;
    
    const pfp = pfpRef.current;
    const heroImage = heroImageRef.current;
    
    // Fix container styling for the pfp element only
    pfp.style.outline = "none"; // Remove any outline/border during animation
    
    // Animation state
    const state = {
        isBlinking: false,
        isMouthMoving: false,
        isSliding: false,
        hasGlasses: false,
        currentSrc: normalSrc,
        slideCount: 0,
        mouthMoveCount: 0 // Track number of mouth movements
    };
    
    // Function to update the image source with proper state tracking
    function updateImage(newSrc) {
        if (state.currentSrc !== newSrc) {
            setCurrentSrc(newSrc);
            state.currentSrc = newSrc;
        }
    }
    
    // No cache needed
    
    // Optimized blink function
    function blink() {
        if (state.isBlinking || state.isSliding) return;
        
        // Prevent any background flashing by ensuring images are in cache
        state.isBlinking = true;
        
        // Choose the right blink image based on glasses state
        if (state.hasGlasses) {
            updateImage(glassesBlinkSrc);
        } else {
            updateImage(blinkSrc);
        }
        
        // Swap back after 200ms - slight reduction for more natural feel
        setTimeout(() => {
            // Always return to glasses version if glasses have been added
            if (state.hasGlasses) {
                updateImage(glassesSrc);
            } else {
                updateImage(normalSrc);
            }
            state.isBlinking = false;
        }, 200);
    }
    
    // Mouth movement animation - only happens before glasses appear
    function moveMouth() {
        // Skip if animations are happening or glasses are already on
        if (state.isMouthMoving || state.isSliding || state.hasGlasses) return;
        
        state.isMouthMoving = true;
        state.mouthMoveCount++;
        
        // Switch to mouth open (only happens without glasses)
        updateImage(mouthOpenSrc);
        
        // Keep mouth open for 800ms
        setTimeout(() => {
            // Return to normal state
            updateImage(normalSrc);
            state.isMouthMoving = false;
        }, 800);
    }
    
    // Slide animation
    function slideDown() {
        if (state.isSliding) return;
        
        state.isSliding = true;
        
        // Use a natural easing for the slide down effect
        pfp.style.transition = "transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)";
        
        // Slide down smoothly
        pfp.style.transform = "translateY(100%)";
        
        // After sliding out completely
        setTimeout(() => {
            // Hide and move up out of view instantly
            pfp.style.transition = "none";
            pfp.style.transform = "translateY(-100%)";
            
            // Increment slide count
            state.slideCount++;
            
            // Update glasses state on first slide
            if (state.slideCount === 1) {
                state.hasGlasses = true;
            }
            
            // Always use glasses image when reappearing
            updateImage(glassesSrc);
            
            // Force browser reflow to ensure the transition reset takes effect
            pfp.offsetHeight;
            
            // Restore transition for the entrance with a bounce effect
            pfp.style.transition = "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            
            // Bounce in effect
            setTimeout(() => {
                pfp.style.transform = "translateY(0)";
                
                // Animation complete
                setTimeout(() => {
                    state.isSliding = false;
                }, 700);
            }, 50);
        }, 800);
    }
    
    // Add slight delay before starting animations
    const startAnimationsTimeout = setTimeout(() => {
      // Initial blink within first second
      setTimeout(blink, 800);
      
      // Then continue regular blinks every 3 seconds
      const blinkInterval = setInterval(blink, 3000);
      
      // Schedule mouth movements - only before glasses appear
      function scheduleMouthMovements() {
          // First mouth movement at 5 seconds
          const firstMouthMoveTimeout = setTimeout(moveMouth, 5000);
          
          // Second mouth movement at 10 seconds (before sunglasses appear at 15s)
          const secondMouthMoveTimeout = setTimeout(moveMouth, 10000);
          
          return [firstMouthMoveTimeout, secondMouthMoveTimeout];
      }
      
      // Start the glasses slide animation once at 15 seconds
      function startGlassesAnimation() {
          const glassesTimeout = setTimeout(() => {
              // Just do the slide animation once to add glasses
              slideDown();
          }, 15000);
          
          return glassesTimeout;
      }
      
      // Start all animations
      const mouthTimeouts = scheduleMouthMovements();
      const glassesTimeout = startGlassesAnimation();
      
      // Return cleanup function
      return () => {
        clearInterval(blinkInterval);
        mouthTimeouts.forEach(timeout => clearTimeout(timeout));
        clearTimeout(glassesTimeout);
      };
    }, 1000); // Increase initial delay to ensure all images are fully loaded
    
    // Clean up on unmount
    return () => {
      clearTimeout(startAnimationsTimeout);
    };
  }, [isClient, imagesLoaded, readyForAnimation]); // Only run when all conditions are met

  return (
    <div 
      className="hero-image relative" 
      ref={heroImageRef}
      style={{
        background: "#0B1119 url('/img/milady-bg.jpg') no-repeat center center",
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden", // Hide content outside container
        willChange: "auto" // Don't optimize background as it causes flashing
      }}
    >
      <div 
        ref={pfpRef}
        id="pfp" 
        className="relative w-[180px] h-[180px] float-right sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px]"
        style={{ 
          transition: readyForAnimation ? "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
          outline: "none",
          border: "none",
          opacity: readyForAnimation ? 1 : 0, // Don't show until completely ready to animate
          transform: "translateY(0)", // Ensure starting position is correct
          willChange: "transform", // Only optimize transform, not opacity
          backfaceVisibility: "hidden", // Prevent flickering
          WebkitBackfaceVisibility: "hidden"
        }}
      >
        <NextImage 
          src={currentSrc}
          alt="douvy profile" 
          fill
          sizes="(max-width: 768px) 120px, 180px"
          priority={true}
          quality={95}
          onLoadingComplete={() => {
            // Ensure the initial image is loaded
            if (!imagesLoaded) {
              setImagesLoaded(true);
            }
          }}
        />
      </div>
    </div>
  );
}