document.addEventListener('DOMContentLoaded', function() {
    // Get the profile picture element
    const pfp = document.getElementById('pfp');
    
    // Store the original source
    const originalSrc = pfp.src;
    const blinkSrc = 'assets/img/milady-blink.jpg';
    
    // Preload the blink image for smooth transition
    const preloadImg = new Image();
    preloadImg.src = blinkSrc;
    
    // Create a simple blink function with slower timing
    function blink() {
      // Quick swap to blink image
      pfp.src = blinkSrc;
      
      // Then swap back after longer duration (250ms for a slower blink)
      setTimeout(() => {
        pfp.src = originalSrc;
      }, 250);
    }
    
    // Add a slight fade effect using CSS
    pfp.style.transition = 'filter 0.07s ease';
    
    // Enhance the blink with a subtle blur during transition
    const enhancedBlink = () => {
      // Very slight blur effect as blink begins
      pfp.style.filter = 'brightness(0.98)';
      
      // Do the blink
      blink();
      
      // Remove blur effect
      setTimeout(() => {
        pfp.style.filter = 'none';
      }, 300);
    };
    
    // Set interval for blinking exactly every 3.5 seconds
    // No additional randomness that would disrupt the timing
    setInterval(enhancedBlink, 3500);
  });