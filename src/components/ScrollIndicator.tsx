import React, { useEffect } from 'react';

export default function ScrollIndicator(): React.ReactElement {
  useEffect(() => {
    // Immediate script to hide scroll indicator on scroll
    const handleScroll = (): void => {
      const indicator = document.querySelector('.scroll-indicator');
      if (indicator instanceof HTMLElement) {
        indicator.style.display = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll, { once: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className="scroll-indicator" 
      role="button" 
      tabIndex={0} 
      aria-label="Scroll to portfolio section"
    >
      <a href="#portfolio" className="scroll-link">
        <div className="scroll-arrow"></div>
      </a>
    </div>
  );
}