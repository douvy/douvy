import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createBlowDaisy, findCollageDaisy, type BlowDaisy, type CollageDaisy } from '@/components/blowDaisy';

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

// A daisy from the footer strip floats up to her the first time she shows the
// normal look, then every Nth time after - every cycle would wear thin
const DAISY_EVERY = 3;
// How long she is on screen before the daisy lifts off. It crosses the bio
// on its way up, so it waits until a visitor has had time to read the name
// and the first paragraph (about 30 words).
const DAISY_STARTS_AT = 8000;

const SLIDE_OUT_MS = 1150;
const SLIDE_IN_MS = 1100;
// Beat with the frame empty between sliding out and dropping back in
const SLIDE_GAP_MS = 220;

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
    let daisy: BlowDaisy | undefined;
    // True while the daisy hangs in front of her, waiting to be blown
    let daisyWaiting = false;
    let blowNow = false;
    let visitsUntilDaisy = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // A daisy floats up from the footer strip to her mouth, she blows, the
    // petals fly off. A skip or unmount removes the daisy, which rejects
    // whatever is awaited.
    const blowDaisy = async (from: CollageDaisy): Promise<void> => {
      const flower = createBlowDaisy(container, from);
      daisy = flower;
      blowNow = false;
      try {
        const rising = flower.rise();
        // The climb takes a few seconds; she keeps blinking while it comes
        await sleep(1700);
        await blink();
        await sleep(2600);
        await blink();
        await rising;

        // It hangs in front of her for a few seconds before she decides to
        // blow. A click/tap during the wait makes her blow right away.
        flower.hover();
        daisyWaiting = true;
        await sleep(1500);
        if (!blowNow) await blink();
        if (!blowNow) await sleep(1300);
        daisyWaiting = false;

        show(mouthOpenSrc);
        const scattered = flower.scatter();
        scattered.catch(() => {}); // settles after leave(); handled by the await below
        await sleep(850);
        show(LOOKS[look].open);
        await flower.leave();
        await scattered;
      } catch {
        // Removed mid-animation (the component unmounted)
      } finally {
        daisyWaiting = false;
        flower.remove();
        daisy = undefined;
      }
    };

    // Slide down out of the frame, swap the look while hidden, bounce back in
    // from the top. Web Animations keep the transform on the compositor.
    const slideTo = async (next: Look): Promise<void> => {
      const setBorder = (value: string): void => {
        imgs.forEach((img) => { img.style.border = value; });
      };

      sliding = true;
      setBorder('none'); // the image border looks wrong while it moves
      // Out: a small lift first, like winding up, then the drop
      slide = pfp.animate(
        [
          { transform: 'translateY(0)', easing: 'ease-out' },
          { transform: 'translateY(-4%)', offset: 0.2, easing: 'cubic-bezier(0.55, 0, 0.75, 0.3)' },
          { transform: 'translateY(100%)' },
        ],
        { duration: SLIDE_OUT_MS, fill: 'forwards' }
      );
      await slide.finished;

      look = next;
      show(LOOKS[look].open);

      // In: drops from above, lands a little past rest, and settles back
      const slideOut = slide;
      slide = pfp.animate(
        [
          { transform: 'translateY(-100%)', easing: 'cubic-bezier(0.3, 0.6, 0.35, 1)' },
          { transform: 'translateY(5%)', offset: 0.6, easing: 'ease-in-out' },
          { transform: 'translateY(-1.5%)', offset: 0.82, easing: 'ease-in-out' },
          { transform: 'translateY(0)' },
        ],
        { duration: SLIDE_IN_MS, delay: SLIDE_GAP_MS, fill: 'both' }
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
      const { blink: canBlink } = LOOKS[look];

      // The normal look gets one mouth event: usually a brief open mouth,
      // sometimes the daisy
      const daisyDue = look === 'normal' && !reducedMotion && visitsUntilDaisy <= 0;
      if (look === 'normal' && !daisyDue) visitsUntilDaisy--;
      const mouthAt = look === 'normal' ? (daisyDue ? DAISY_STARTS_AT : 3000) : undefined;
      // No scheduled blinks during the daisy; it does its own
      const mouthLasts = daisyDue ? 14000 : 1300;
      // A daisy visit lasts until the daisy is done (cues run one at a time,
      // so the closing cue simply waits its turn)
      const duration = daisyDue ? DAISY_STARTS_AT + 500 : LOOKS[look].dwell;

      type Cue = { at: number; run: () => Promise<void> };
      const cues: Cue[] = [{ at: duration, run: async () => {} }];
      if (mouthAt !== undefined) {
        cues.push({
          at: mouthAt,
          run: async () => {
            if (!daisyDue) return moveMouth();
            visitsUntilDaisy = DAISY_EVERY - 1;
            await blowDaisy(findCollageDaisy(container));
          },
        });
      }
      if (canBlink) {
        for (let at = between(800, 1800); at < duration - 500; at += between(2000, 6000)) {
          // Keep blinks from butting up against the mouth movement
          if (mouthAt !== undefined && at > mouthAt - 500 && at < mouthAt + mouthLasts) continue;
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

    // Click, tap, Enter or Space jumps straight to the next look - except
    // while the daisy is playing, which a click must never cut short. Then it
    // does nothing, or, if the daisy is waiting in front of her, makes her blow.
    const skip = (): void => {
      if (sliding) return;
      if (daisy) {
        if (daisyWaiting) {
          blowNow = true;
          clearTimeout(timer);
          endSleep?.();
        }
        return;
      }
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
      daisy?.remove();
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
