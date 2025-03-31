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
    const glassesSrc = 'assets/img/milady-glasses.png';
    const glassesBlinkSrc = 'assets/img/milady-glasses-blink.png';
    
    // Preload all images for smooth transitions
    const preloadImages = [
        normalSrc, blinkSrc, mouthOpenSrc, glassesSrc, glassesBlinkSrc
    ].map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
    
    // Set up transitions for animations
    pfp.style.transition = "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
    
    // Animation state
    const state = {
        isBlinking: false,
        isMouthMoving: false,
        isSliding: false,
        hasGlasses: false,
        currentSrc: normalSrc,
        slideCount: 0,
        hasDoneMouthMovement: false // Track if mouth has already moved once
    };
    
    // Function to update the image source with proper state tracking
    function updateImage(newSrc) {
        if (state.currentSrc !== newSrc) {
            pfp.src = newSrc;
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
    
    // Mouth movement animation - only happens once
    function moveMouth() {
        // Skip if mouth has already moved once or other animations are happening
        if (state.hasDoneMouthMovement || state.isMouthMoving || state.isSliding || state.hasGlasses) return;
        
        state.isMouthMoving = true;
        
        // Switch to mouth open
        updateImage(mouthOpenSrc);
        
        // Keep mouth open for 800ms
        setTimeout(() => {
            updateImage(normalSrc);
            state.isMouthMoving = false;
            state.hasDoneMouthMovement = true; // Mark that mouth has moved once
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
    setInterval(blink, 3000);
    
    // Mouth movement happens only once
    setTimeout(moveMouth, 5000);
    
    // Start the first slide at 7.5 seconds, then every 7.5 seconds
    function startSlideAnimations() {
        setTimeout(() => {
            function scheduleNextSlide() {
                slideDown();
                setTimeout(scheduleNextSlide, 7500);
            }
            scheduleNextSlide();
        }, 7500);
    }
    
    // Start animations
    startSlideAnimations();
});