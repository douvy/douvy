document.addEventListener('DOMContentLoaded', function() {
    // Get the profile picture element
    const pfp = document.getElementById('pfp');
    const heroImage = document.querySelector('.hero-image');
    
    // Fix container styling
    heroImage.style.backgroundImage = "url('assets/img/milady-bg.jpg')";
    heroImage.style.backgroundSize = "cover";
    heroImage.style.backgroundPosition = "center";
    heroImage.style.position = "relative";
    heroImage.style.overflow = "hidden"; // Hide content outside container
    
    // Remove any borders that might be causing lines
    pfp.style.border = "none";
    pfp.style.outline = "none";
    pfp.style.boxShadow = "none";
    
    // Image sources - using img directory as specified
    const normalSrc = 'assets/img/milady-no-bg.png';
    const blinkSrc = 'assets/img/milady-blink.png'; 
    const mouthOpenSrc = 'assets/img/milady-mouth-open.png';
    
    // Preload all images for smooth transitions
    const preloadImages = [normalSrc, blinkSrc, mouthOpenSrc].map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
    
    // Set up transitions for animations - make the slide smoother
    pfp.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    
    // Animation flags
    let isBlinking = false;
    let isMouthMoving = false;
    let isSliding = false;
    let currentSrc = normalSrc;
    
    // Function to update the image source with proper state tracking
    function updateImage(newSrc) {
        if (currentSrc !== newSrc) {
            pfp.src = newSrc;
            currentSrc = newSrc;
        }
    }
    
    // Blink function - operates independently
    function blink() {
        if (isBlinking) return;
        
        isBlinking = true;
        
        // Save the current state to return to
        const prevSrc = currentSrc;
        
        // Swap to blink image
        updateImage(blinkSrc);
        
        // Swap back after 250ms for a slower blink
        setTimeout(() => {
            // Return to previous state (either normal or mouth open)
            updateImage(prevSrc);
            isBlinking = false;
        }, 250);
    }
    
    // Mouth movement animation - independent from blink
    function moveMouth() {
        if (isMouthMoving || isSliding) return;
        
        isMouthMoving = true;
        
        // Switch to mouth open immediately
        updateImage(mouthOpenSrc);
        
        // Keep mouth open for 800ms
        setTimeout(() => {
            // Switch back to normal
            updateImage(normalSrc);
            isMouthMoving = false;
        }, 800);
    }
    
    // Improved slide animation with more subtle, natural movement like Mario going into a pipe
    function slideDown() {
        if (isSliding) return;
        
        isSliding = true;
        
        // Use a more natural easing for the slide down effect
        pfp.style.transition = "transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)";
        
        // Slide down smoothly
        pfp.style.transform = "translateY(100%)";
        
        // After sliding out completely
        setTimeout(() => {
            // Hide and move up out of view instantly
            pfp.style.transition = "none";
            pfp.style.transform = "translateY(-100%)";
            
            // Force browser reflow to ensure the transition reset takes effect
            pfp.offsetHeight;
            
            // Restore transition for the entrance with a bounce effect
            pfp.style.transition = "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            
            // Bounce in effect
            setTimeout(() => {
                pfp.style.transform = "translateY(0)";
                
                // Animation complete - ensure we don't trigger another animation too soon
                setTimeout(() => {
                    isSliding = false;
                }, 700);
            }, 50);
        }, 800);
    }
    
    // Set up the animation timings
    
    // Changed: Blink precisely every 3 seconds as requested (instead of 3.5)
    setInterval(blink, 3000);
    
    // Mouth movement every exactly 6 seconds as requested
    function startMouthMovements() {
        // First mouth movement after 5 seconds
        setTimeout(() => {
            moveMouth();
            // Then every 6 seconds exactly after that
            setInterval(moveMouth, 6000);
        }, 5000);
    }
    
    // Start the first slide exactly at 7.5 seconds, then every 7.5 seconds after that
    // Fixed: Made sure the next slide only happens after the animation is fully complete
    function startSlideAnimations() {
        // First slide after exactly 7.5 seconds
        setTimeout(() => {
            // Create a custom interval that ensures each animation completes before starting the next
            function scheduleNextSlide() {
                slideDown();
                
                // Schedule the next slide after exactly 7.5 seconds
                setTimeout(scheduleNextSlide, 7500);
            }
            
            // Start the cycle
            scheduleNextSlide();
        }, 7500);
    }
    
    // Start animations
    startMouthMovements();
    startSlideAnimations();
});