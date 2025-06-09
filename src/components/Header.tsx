import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  isProfilePictureVisible: boolean;
}

export default function Header({ isProfilePictureVisible }: HeaderProps): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasMogged, setHasMogged] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        )
      ) {
        if (event.key === "l" || event.key === "L" || event.key === "d" || event.key === "D") {
          toggleTheme();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleTheme]);

  // Separate effect for managing blinking when milady becomes visible/hidden
  useEffect(() => {
    if (isProfilePictureVisible || hasMogged) {
      // If profile picture is visible OR we're in mog state, don't blink
      // Also ensure blinking state is cleared when hidden
      setIsBlinking(false);
      return;
    }

    // Start blinking when milady becomes visible and not in mog state
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3500);

    // Initial blink
    setTimeout(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 200);

    return () => {
      clearInterval(blinkInterval);
    };
  }, [isProfilePictureVisible, hasMogged]);

  // Separate effect for the main animation sequence (only runs once)
  useEffect(() => {
    // Don't start the main sequence if profile picture is visible initially
    if (isProfilePictureVisible) {
      return;
    }

    // Mog transition after 25 seconds with slide animation
    const mogTimeout = setTimeout(() => {
      setIsSliding(true);
      setIsBlinking(false); // Stop any current blink
      
      // Slide animation sequence
      const logoElement = document.querySelector('#header-logo') as HTMLElement;
      if (logoElement) {
        // Slide down
        logoElement.style.transition = 'transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)';
        logoElement.style.transform = 'translateY(100%)';
        
        setTimeout(() => {
          // Move up out of view and switch to mog
          logoElement.style.transition = 'none';
          logoElement.style.transform = 'translateY(-100%)';
          setHasMogged(true);
          
          // Force reflow
          logoElement.offsetHeight;
          
          // Bounce back in with mog
          logoElement.style.transition = 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          
          setTimeout(() => {
            logoElement.style.transform = 'translateY(0)';
            
            setTimeout(() => {
              setIsSliding(false);
            }, 700);
          }, 50);
        }, 800);
      }
    }, 25000);

    return () => {
      clearTimeout(mogTimeout);
    };
  }, [isProfilePictureVisible]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out border-b ${
        theme === 'dark' 
          ? 'bg-[#111216] border-[#20252c]'
          : 'bg-[#f5f5f3] border-[#dde9f7]'
      }`}
    >
      <div className="flex justify-center py-4">
        <div className="w-full md:w-10/12 lg:w-8/12 px-4">
          <div className="flex justify-between items-center">
            <a
              href="/"
              className="flex items-center transition-opacity duration-200 ease-in-out hover:opacity-75 overflow-hidden"
              aria-label="douvy - Home"
            >
              <img
                id="header-logo"
                src={
                  hasMogged 
                    ? "/img/milady-mog.png" 
                    : isBlinking 
                      ? "/img/milady-blink.png" 
                      : "/img/milady-no-bg.png"
                }
                alt="douvy logo"
                className="h-8 w-auto sm:h-10 transition-all duration-300 ease-in-out ml-1 sm:ml-0"
                width="32"
                height="32"
                style={{ 
                  transform: 'translateY(0)',
                  opacity: isProfilePictureVisible ? 0 : 1,
                  visibility: isProfilePictureVisible ? 'hidden' : 'visible'
                }}
              />
            </a>
            <button
              onClick={toggleTheme}
              className={`inline-block relative w-auto h-8 sm:h-10 rounded-md overflow-hidden border-y-2 border-x-2 border-b-solid transition-colors duration-300 ease-in-out font-vulf mr-1 sm:mr-0 ${
                theme === 'dark' 
                  ? 'border-dark-border hover:border-dark-border-hover'
                  : 'border-light-border hover:border-light-border-hover'
              }`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode - Press the '${theme === 'dark' ? 'l' : 'd'}' key as a shortcut`}
            >
              <span className={`flex items-center justify-between w-full h-full px-2 sm:px-2.5 transition-colors duration-300 ease-in-out ${
                theme === 'dark'
                  ? 'text-white bg-dark-bg hover:bg-dark-bg-hover'
                  : 'text-light-text bg-light-bg hover:bg-light-bg-hover'
              }`}>
                <span className="text-[10px] sm:text-xs font-semibold italic">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <span className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded ml-1 my-0 border ${
                  theme === 'dark'
                    ? 'bg-dark-element border-dark-element-border'
                    : 'bg-light-hotkey-bg border-light-element-border'
                }`}>
                  <span className={`text-[10px] sm:text-xs font-bold leading-none ${
                    theme === 'dark' ? 'text-white' : 'text-light-hotkey'
                  }`}>{theme === 'dark' ? 'L' : 'D'}</span>
                </span>
              </span>

              <span className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
                theme === 'dark' ? 'bg-dark-shadow' : 'bg-light-element'
              }`}></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}