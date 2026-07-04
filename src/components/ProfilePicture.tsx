import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Avatar image sources - declared outside component to prevent re-creation
const normalSrc = '/img/milady-no-bg.png';
const blinkSrc = '/img/milady-blink.png';
const mouthOpenSrc = '/img/milady-mouth-open.png';
const glassesSrc = '/img/milady-glasses.png';
const glassesBlinkSrc = '/img/milady-glasses-blink.png';
const haloSrc = '/img/milady-halo.png';
const haloBlinkSrc = '/img/milady-blink-halo.png';

const allSrcs = [normalSrc, blinkSrc, mouthOpenSrc, glassesSrc, glassesBlinkSrc, haloSrc, haloBlinkSrc];

interface AnimationState {
  isBlinking: boolean;
  isMouthMoving: boolean;
  isSliding: boolean;
  hasGlasses: boolean;
  hasHalo: boolean;
}

// NEVER touch background image after it loads - it causes glitches
// Preload every animation frame so src swaps never flash
const preloadImages = (): Promise<string[]> => {
  if (typeof window === 'undefined') return Promise.resolve([]);

  return Promise.all(
    allSrcs.map(
      (src) =>
        new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(`Failed to load ${src}`);
          img.src = src;
        })
    )
  );
};

export default function ProfilePicture(): React.ReactElement {
  const [currentSrc, setCurrentSrc] = useState<string>(normalSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [animationsStarted, setAnimationsStarted] = useState<boolean>(false);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const pfpRef = useRef<HTMLDivElement>(null);

  // Animation state maintained in a ref to prevent re-renders
  const stateRef = useRef<AnimationState>({
    isBlinking: false,
    isMouthMoving: false,
    isSliding: false,
    hasGlasses: false,
    hasHalo: false
  });

  // First, preload all animation images
  useEffect(() => {
    if (typeof window === 'undefined') return;

    preloadImages()
      .then(() => setImagesPreloaded(true))
      .catch(err => {
        console.error('Error preloading images:', err);
        // Still set as true so animations can eventually start
        setImagesPreloaded(true);
      });
  }, []);

  // Start animation after everything is fully loaded
  useEffect(() => {
    if (!isLoaded || !imagesPreloaded || animationsStarted) return;

    let cleanupTimers: (() => void) | undefined;

    // Small delay before starting animations so everything is fully rendered
    const startupDelay = setTimeout(() => {
      setAnimationsStarted(true);
      const state = stateRef.current;

      // Blink with fixed timing (200ms is good for a natural blink)
      function blink(): void {
        if (state.isBlinking || state.isSliding) return;

        state.isBlinking = true;
        setCurrentSrc(state.hasHalo ? haloBlinkSrc : state.hasGlasses ? glassesBlinkSrc : blinkSrc);

        setTimeout(() => {
          setCurrentSrc(state.hasHalo ? haloSrc : state.hasGlasses ? glassesSrc : normalSrc);
          state.isBlinking = false;
        }, 200);
      }

      function moveMouth(): void {
        if (state.isMouthMoving || state.isSliding || state.hasGlasses) return;

        state.isMouthMoving = true;
        setCurrentSrc(mouthOpenSrc);

        setTimeout(() => {
          setCurrentSrc(normalSrc);
          state.isMouthMoving = false;
        }, 800);
      }

      // Shared slide animation: slide down out of view, swap the image while
      // hidden (onHidden), bounce back in, then run onSettled once landed.
      function slideSwap(onHidden: () => void, onSettled?: () => void): void {
        if (state.isSliding || !pfpRef.current) return;

        state.isSliding = true;
        const pfp = pfpRef.current;
        const img = pfp.querySelector('img');

        // Remove border during transition
        if (img) img.style.border = "none";

        pfp.style.transition = "transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)";
        pfp.style.transform = "translateY(100%)";

        setTimeout(() => {
          // Reposition above the frame while hidden and swap the image
          pfp.style.transition = "none";
          pfp.style.transform = "translateY(-100%)";
          onHidden();

          // Force reflow so the position change applies before animating back in
          pfp.offsetHeight;

          pfp.style.transition = "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

          setTimeout(() => {
            pfp.style.transform = "translateY(0)";

            setTimeout(() => {
              // Restore border after animation completes
              if (img) img.style.border = "";
              state.isSliding = false;
              onSettled?.();
            }, 700);
          }, 50);
        }, 800);
      }

      // Blink immediately on startup, then every 3.5 seconds
      blink();
      const blinkInterval = setInterval(blink, 3500);

      // Mouth movements, with extra delay for the first (lets the browser settle)
      const firstMouthTimeout = setTimeout(moveMouth, 6000);
      const secondMouthTimeout = setTimeout(moveMouth, 10000);

      // Sequence: glasses at 15s, halo at 35s, restart at 45s (halo shown 10s)
      const glassesTimeout = setTimeout(() => {
        slideSwap(() => {
          state.hasGlasses = true;
          setCurrentSrc(glassesSrc);
        });
      }, 15000);

      const haloTimeout = setTimeout(() => {
        slideSwap(() => {
          state.hasHalo = true;
          setCurrentSrc(haloSrc);
        });
      }, 35000);

      const restartTimeout = setTimeout(() => {
        slideSwap(
          () => {
            // Reset all state while hidden
            state.hasGlasses = false;
            state.hasHalo = false;
            setCurrentSrc(normalSrc);
          },
          () => {
            state.isBlinking = false;
            state.isMouthMoving = false;

            // Toggling animationsStarted re-runs this effect from the top
            setAnimationsStarted(false);
            setTimeout(() => setAnimationsStarted(true), 100);
          }
        );
      }, 45000);

      cleanupTimers = () => {
        clearInterval(blinkInterval);
        clearTimeout(firstMouthTimeout);
        clearTimeout(secondMouthTimeout);
        clearTimeout(glassesTimeout);
        clearTimeout(haloTimeout);
        clearTimeout(restartTimeout);
      };
    }, 2000);

    return () => {
      clearTimeout(startupDelay);
      cleanupTimers?.();
    };
  }, [isLoaded, imagesPreloaded, animationsStarted]);

  return (
    <div
      className="hero-image relative"
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
