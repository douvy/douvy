import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Look = 'normal' | 'glasses';

interface LookConfig {
  open: string;
  /** Omitted for looks that hide the eyes. */
  blink?: string;
  /** How long the look stays before sliding to the next one (ms). */
  dwell: number;
  next: Look;
}

// The cycle: normal -> glasses -> normal. The first change comes
// early so visitors who only stay a few seconds still see one.
const LOOKS: Record<Look, LookConfig> = {
  normal: { open: '/img/milady-no-bg.png', blink: '/img/milady-blink.png', dwell: 6000, next: 'glasses' },
  // No blink frame: the eyes are behind opaque lenses
  glasses: { open: '/img/milady-glasses.png', dwell: 14000, next: 'normal' },
};
const normalSrc = LOOKS.normal.open;
const mouthOpenSrc = '/img/milady-mouth-open.png';

const allSrcs = [
  ...Object.values(LOOKS).flatMap((look) => (look.blink ? [look.open, look.blink] : [look.open])),
  mouthOpenSrc,
];

const SLIDE_OUT_MS = 800;
const SLIDE_IN_MS = 700;

const between = (min: number, max: number): number => min + Math.random() * (max - min);

export default function ProfilePicture(): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const pfpRef = useRef<HTMLDivElement>(null);
  // Frames that finished loading (or failed - a missing frame must not
  // block the animation forever)
  const settledFrames = useRef<Set<string>>(new Set());

  const handleFrameSettled = (src: string): void => {
    settledFrames.current.add(src);
    if (settledFrames.current.size === allSrcs.length) setIsLoaded(true);
  };

  // The whole animation is one sequential async script that writes straight
  // to the DOM: no React renders per frame, and no overlapping timers to race.
  useEffect(() => {
    const pfp = pfpRef.current;
    const container = pfp?.parentElement;
    if (!isLoaded || !pfp || !container) return;

    const imgs = Array.from(pfp.querySelectorAll('img'));
    let look: Look = 'normal';
    let timer: ReturnType<typeof setTimeout> | undefined;
    let endSleep: (() => void) | undefined;
    let slide: Animation | undefined;
    let sliding = false;
    // Set by a click/tap: cut the current look short and slide to the next
    let skipRequested = false;

    const show = (src: string): void => {
      imgs.forEach((img) => {
        img.style.opacity = img.dataset.frame === src ? '1' : '0';
      });
    };

    // After cleanup these promises never settle, which parks the script for good.
    const sleep = (ms: number): Promise<void> =>
      skipRequested
        ? Promise.resolve()
        : new Promise((resolve) => {
            endSleep = resolve;
            timer = setTimeout(resolve, ms);
          });

    // Only animate while the picture is on screen in a visible tab
    let inView = true;
    let wake: (() => void) | undefined;
    const isActive = (): boolean => inView && !document.hidden;
    const onActivityChange = (): void => {
      if (isActive()) {
        wake?.();
        wake = undefined;
      }
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
      });
      onActivityChange();
    });
    // Observe the frame, not #pfp itself - #pfp slides out of it mid-animation
    observer.observe(container);
    document.addEventListener('visibilitychange', onActivityChange);
    const whenActive = (): Promise<void> =>
      isActive() ? Promise.resolve() : new Promise((resolve) => { wake = resolve; });

    const blink = async (): Promise<void> => {
      const { open, blink: closed } = LOOKS[look];
      if (!closed) return;
      show(closed);
      await sleep(200); // 200ms reads as a natural blink
      show(open);
    };

    const doubleBlink = async (): Promise<void> => {
      await blink();
      await sleep(120);
      await blink();
    };

    const moveMouth = async (): Promise<void> => {
      show(mouthOpenSrc);
      await sleep(800);
      show(LOOKS[look].open);
    };

    // Slide down out of the frame, swap the look while hidden, bounce back in
    // from the top. Web Animations keep the transform on the compositor.
    const slideTo = async (next: Look): Promise<void> => {
      const setBorder = (value: string): void => {
        imgs.forEach((img) => { img.style.border = value; });
      };

      sliding = true;
      setBorder('none'); // the image border looks wrong while it moves
      slide = pfp.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
        { duration: SLIDE_OUT_MS, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' }
      );
      await slide.finished;

      look = next;
      show(LOOKS[look].open);

      const slideOut = slide;
      slide = pfp.animate(
        [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
        { duration: SLIDE_IN_MS, delay: 50, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'both' }
      );
      slideOut.cancel();
      await slide.finished;

      slide.cancel(); // resting position comes from the inline style again
      setBorder('');
      sliding = false;
    };

    // Hold the current look for its dwell time, blinking at irregular
    // intervals (a fixed interval looks mechanical). Returns early on skip.
    const dwell = async (): Promise<void> => {
      skipRequested = false;
      const { dwell: duration, blink: canBlink } = LOOKS[look];

      type Cue = { at: number; run: () => Promise<void> };
      const cues: Cue[] = [{ at: duration, run: async () => {} }];
      const mouthAt = look === 'normal' ? 3000 : undefined;
      if (mouthAt !== undefined) cues.push({ at: mouthAt, run: moveMouth });
      if (canBlink) {
        for (let at = between(800, 1800); at < duration - 500; at += between(2000, 6000)) {
          // Keep blinks from butting up against the mouth movement
          if (mouthAt !== undefined && at > mouthAt - 500 && at < mouthAt + 1300) continue;
          cues.push({ at, run: Math.random() < 0.2 ? doubleBlink : blink });
        }
      }
      cues.sort((a, b) => a.at - b.at);

      let start = performance.now();
      for (const cue of cues) {
        await sleep(start + cue.at - performance.now());
        if (skipRequested) return;
        await whenActive();

        // After a pause (off screen, background tab) push the rest of the
        // dwell back instead of replaying the missed cues in a burst
        const late = performance.now() - (start + cue.at);
        if (late > 1000) start += late;

        await cue.run();
        if (skipRequested) return;
      }
    };

    const run = async (): Promise<void> => {
      for (;;) {
        await dwell();
        await slideTo(LOOKS[look].next);
      }
    };

    // Click, tap, Enter or Space jumps straight to the next look
    const skip = (): void => {
      if (sliding) return;
      skipRequested = true;
      clearTimeout(timer);
      endSleep?.();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Space would scroll the page
        skip();
      }
    };
    container.addEventListener('click', skip);
    container.addEventListener('keydown', onKeyDown);

    // Cancelling a slide in cleanup rejects its `finished` promise
    run().catch(() => {});

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onActivityChange);
      container.removeEventListener('click', skip);
      container.removeEventListener('keydown', onKeyDown);
      slide?.cancel();
      imgs.forEach((img) => { img.style.border = ''; });
      show(normalSrc);
    };
  }, [isLoaded]);

  return (
    <div
      className="hero-image relative cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Change douvy's look"
      style={{
        backgroundImage: "url('/img/milady-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        position: "relative",
        overflow: "hidden",
        // No grey flash or double-tap zoom delay when tapped on mobile
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation"
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
        {/* Every frame stays mounted and stacked. The animation flips opacity
            on the DOM nodes directly, so the opacity rendered here is only the
            initial state and must stay constant - React would otherwise
            overwrite the animation on re-render. Swapping src instead would
            refetch/decode mid-animation and flash. */}
        {allSrcs.map((src) => (
          <Image
            key={src}
            data-frame={src}
            src={src}
            alt={src === normalSrc ? "douvy profile" : ""}
            aria-hidden={src !== normalSrc}
            fill
            sizes="(max-width: 768px) 120px, 180px"
            priority={src === normalSrc}
            loading={src === normalSrc ? undefined : "eager"}
            // Decode with the paint: async decoding can show the background
            // for a frame the first time a hidden frame becomes visible
            decoding="sync"
            draggable={false}
            style={{ opacity: src === normalSrc ? 1 : 0 }}
            onLoad={() => handleFrameSettled(src)}
            onError={() => handleFrameSettled(src)}
          />
        ))}
      </div>
    </div>
  );
}
