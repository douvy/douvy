import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Look = 'normal' | 'glasses' | 'halo';

// Avatar animation frames
const LOOKS: Record<Look, { open: string; blink: string }> = {
  normal: { open: '/img/milady-no-bg.png', blink: '/img/milady-blink.png' },
  glasses: { open: '/img/milady-glasses.png', blink: '/img/milady-glasses-blink.png' },
  halo: { open: '/img/milady-halo.png', blink: '/img/milady-blink-halo.png' },
};
const normalSrc = LOOKS.normal.open;
const mouthOpenSrc = '/img/milady-mouth-open.png';

const allSrcs = [...Object.values(LOOKS).flatMap((look) => [look.open, look.blink]), mouthOpenSrc];

const BLINK_EVERY = 3500;
const SLIDE_OUT_MS = 800;
const SLIDE_IN_MS = 700;
// Slides start at these points in the cycle; blinks that would land on one are skipped
const SLIDES: { at: number; to: Look }[] = [
  { at: 15000, to: 'glasses' },
  { at: 35000, to: 'halo' },
  { at: 45000, to: 'normal' }, // back to the start; the cycle then repeats
];

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
    let slide: Animation | undefined;

    const show = (src: string): void => {
      imgs.forEach((img) => {
        img.style.opacity = img.dataset.frame === src ? '1' : '0';
      });
    };

    // After cleanup these promises never settle, which parks the script for good.
    const sleep = (ms: number): Promise<void> =>
      new Promise((resolve) => {
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
      show(LOOKS[look].blink);
      await sleep(200); // 200ms reads as a natural blink
      show(LOOKS[look].open);
    };

    const moveMouth = async (): Promise<void> => {
      show(mouthOpenSrc);
      await sleep(800);
      show(normalSrc);
    };

    // Slide down out of the frame, swap the look while hidden, bounce back in
    // from the top. Web Animations keep the transform on the compositor.
    const slideTo = async (next: Look): Promise<void> => {
      const setBorder = (value: string): void => {
        imgs.forEach((img) => { img.style.border = value; });
      };

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
    };

    type Cue = { at: number; run: () => Promise<void> };
    const slideEnd = SLIDE_OUT_MS + 50 + SLIDE_IN_MS;
    const cues: Cue[] = [
      { at: 6000, run: moveMouth },
      { at: 10000, run: moveMouth },
      ...SLIDES.map(({ at, to }) => ({ at, run: () => slideTo(to) })),
    ];
    for (let at = 0; at < 45000; at += BLINK_EVERY) {
      const duringSlide = SLIDES.some((s) => at >= s.at && at < s.at + slideEnd);
      if (!duringSlide) cues.push({ at, run: blink });
    }
    cues.sort((a, b) => a.at - b.at);

    const run = async (): Promise<void> => {
      for (;;) {
        // Small delay before each cycle so everything is settled
        await sleep(2000);
        let start = performance.now();

        for (const cue of cues) {
          await sleep(start + cue.at - performance.now());
          await whenActive();

          // After a pause (off screen, background tab) push the rest of the
          // cycle back instead of replaying the missed cues in a burst
          const late = performance.now() - (start + cue.at);
          if (late > 1000) start += late;

          await cue.run();
        }
      }
    };

    // Cancelling a slide in cleanup rejects its `finished` promise
    run().catch(() => {});

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onActivityChange);
      slide?.cancel();
      imgs.forEach((img) => { img.style.border = ''; });
      show(normalSrc);
    };
  }, [isLoaded]);

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
            style={{ opacity: src === normalSrc ? 1 : 0 }}
            onLoad={() => handleFrameSettled(src)}
            onError={() => handleFrameSettled(src)}
          />
        ))}
      </div>
    </div>
  );
}
