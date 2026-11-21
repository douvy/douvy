import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

const normalSrc = '/img/milady-no-bg.png';
const blinkSrc = '/img/milady-blink.png';
const mogSrc = '/img/milady-mog.png';
const logoSrcs = [normalSrc, blinkSrc, mogSrc];

interface HeaderProps {
  isProfilePictureVisible: boolean;
}

export default function Header({ isProfilePictureVisible }: HeaderProps): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const [isBlinking, setIsBlinking] = useState(false);
  const [hasMogged, setHasMogged] = useState(false);
  const hasMoggedRef = useRef(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const currentSrc = hasMogged ? mogSrc : isBlinking ? blinkSrc : normalSrc;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        !(
          // Leave browser shortcuts alone (Cmd+L is the address bar, Cmd+D bookmarks)
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
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

  // Blink while the header milady is showing and hasn't mogged yet
  useEffect(() => {
    if (isProfilePictureVisible || hasMogged) return;

    let reopen: ReturnType<typeof setTimeout> | undefined;
    const blink = (): void => {
      setIsBlinking(true);
      reopen = setTimeout(() => setIsBlinking(false), 150);
    };

    const firstBlink = setTimeout(blink, 200);
    const blinkInterval = setInterval(blink, 3500);

    return () => {
      clearTimeout(firstBlink);
      clearTimeout(reopen);
      clearInterval(blinkInterval);
      setIsBlinking(false);
    };
  }, [isProfilePictureVisible, hasMogged]);

  // Mog transition: after the header milady has been showing for 25s, slide
  // it out, swap to the mog frame, and bounce it back in. Happens once.
  useEffect(() => {
    const logo = logoRef.current;
    // hasMoggedRef (not the state) guards this so that setting hasMogged
    // mid-slide doesn't re-run the effect and cancel the bounce back in.
    if (isProfilePictureVisible || hasMoggedRef.current || !logo) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number): void => {
      timers.push(setTimeout(fn, ms));
    };

    later(() => {
      // Slide down
      logo.style.transition = 'transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)';
      logo.style.transform = 'translateY(100%)';

      later(() => {
        // Move up out of view and switch to mog
        logo.style.transition = 'none';
        logo.style.transform = 'translateY(-100%)';
        hasMoggedRef.current = true;
        setHasMogged(true);

        // Force reflow so the position change applies before animating back in
        logo.offsetHeight;

        // Bounce back in with mog
        logo.style.transition = 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        later(() => {
          logo.style.transform = 'translateY(0)';
          // Hand transitions back to the stylesheet (opacity fade)
          later(() => { logo.style.transition = ''; }, 700);
        }, 50);
      }, 800);
    }, 25000);

    return () => {
      timers.forEach(clearTimeout);
      // If interrupted mid-slide, don't leave the logo parked out of view
      logo.style.transition = '';
      logo.style.transform = 'translateY(0)';
    };
  }, [isProfilePictureVisible]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out ${
        theme === 'dark'
          ? 'bg-[#111216]'
          : 'bg-[#f5f5f3]'
      }`}
    >
      <div className="flex justify-center py-4">
        <div className={`w-full md:w-10/12 lg:w-8/12 mx-4 md:mx-0 md:px-4 pb-4 border-b transition-colors duration-300 ease-in-out ${
          theme === 'dark'
            ? 'border-[#20252c]'
            : 'border-[#dde9f7]'
        }`}>
          <div className="flex justify-between items-center">
            <a
              href="/"
              className="flex items-center transition-opacity duration-200 ease-in-out hover:opacity-75 overflow-hidden"
              aria-label="douvy - Home"
            >
              <div
                ref={logoRef}
                id="header-logo"
                className="relative h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 ease-in-out ml-1 sm:ml-0"
                style={{
                  transform: 'translateY(0)',
                  opacity: isProfilePictureVisible ? 0 : 1,
                  visibility: isProfilePictureVisible ? 'hidden' : 'visible'
                }}
              >
                {/* Frames stay mounted and stacked; only opacity flips, so
                    blinking never refetches or flashes. */}
                {logoSrcs.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt={src === normalSrc ? "douvy logo" : ""}
                    aria-hidden={src !== normalSrc}
                    fill
                    sizes="40px"
                    loading="eager"
                    style={{ opacity: src === currentSrc ? 1 : 0 }}
                  />
                ))}
              </div>
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