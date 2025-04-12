import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Pre-load these images at build time
const imageProps = {
  width: 180,
  height: 180,
  priority: true,
  quality: 95
};

export default function ProfilePicture() {
  const [isClient, setIsClient] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('/img/milady-no-bg.png');
  const pfpRef = useRef(null);
  const heroImageRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    
    // Exit if pfp element is not found (for pages without the animation)
    if (!pfpRef.current) return;
    
    const pfp = pfpRef.current;
    const heroImage = heroImageRef.current;
    
    // Fix container styling
    heroImage.style.backgroundImage = "url('/img/milady-bg.jpg')";
    heroImage.style.backgroundSize = "cover";
    heroImage.style.backgroundPosition = "center";
    heroImage.style.position = "relative";
    heroImage.style.overflow = "hidden"; // Hide content outside container
    
    // Image sources - using img directory as specified
    const normalSrc = '/img/milady-no-bg.png';
    const blinkSrc = '/img/milady-blink.png'; 
    const mouthOpenSrc = '/img/milady-mouth-open.png';
    const glassesSrc = '/img/milady-glasses.png';
    const glassesBlinkSrc = '/img/milady-glasses-blink.png';
    
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
    
    // Blink function
    function blink() {
        if (state.isBlinking || state.isSliding) return;
        
        state.isBlinking = true;
        
        // Choose the right blink image based on glasses state
        if (state.hasGlasses) {
            updateImage(glassesBlinkSrc);
        } else {
            updateImage(blinkSrc);
        }
        
        // Swap back after 250ms
        setTimeout(() => {
            // Always return to glasses version if glasses have been added
            if (state.hasGlasses) {
                updateImage(glassesSrc);
            } else {
                updateImage(normalSrc);
            }
            state.isBlinking = false;
        }, 250);
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
    
    // Animation timing setup
    
    // Blink precisely every 3 seconds
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
    
    // Clean up on unmount
    return () => {
      clearInterval(blinkInterval);
      mouthTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(glassesTimeout);
    };
  }, []);

  return (
    <div className="hero-image relative" ref={heroImageRef}>
      <div 
        ref={pfpRef}
        id="pfp" 
        className="relative w-[180px] h-[180px] float-right"
        style={{ transition: "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
      >
        <Image 
          src={currentSrc}
          alt="douvy profile" 
          fill
          sizes="180px"
          priority={true}
          quality={95}
        />
      </div>
    </div>
  );
}