'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useTransform, motion } from 'framer-motion';
import Link from 'next/link';

const FRAME_COUNT = 120;

export default function CoffeeScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Preload images
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const index = i.toString().padStart(3, '0');
      img.src = `/coffee-sequence/coffee_${index}.webp`;

      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
      };

      // If image fails to load, we still count it so we don't block forever
      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
      };

      loadedImages.push(img);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (images.length === 0 || loadedCount < FRAME_COUNT) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution to match a high quality aspect ratio, e.g., 1920x1080
    // If the actual images have different dimensions, we use the first loaded image dimensions if possible
    let cw = 1920;
    let ch = 1080;

    // Find first successfully loaded image to get natural dimensions
    const firstValidImg = images.find(img => img.naturalWidth > 0);
    if (firstValidImg) {
      cw = firstValidImg.naturalWidth;
      ch = firstValidImg.naturalHeight;
    }

    canvas.width = cw;
    canvas.height = ch;

    let animationFrameId: number;

    const render = () => {
      const p = smoothProgress.get();
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(p * FRAME_COUNT))
      );

      const img = images[frameIndex];

      if (img && img.complete && img.naturalWidth !== 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback or skip drawing if frame is missing
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [images, loadedCount, smoothProgress]);

  // Loading state overlay
  const progressPercent = Math.round((loadedCount / FRAME_COUNT) * 100);
  const isLoading = loadedCount < FRAME_COUNT;

  // Opacity and Motion mapping for Beats
  // Opacity Mapping: [start, start + 0.1, end - 0.1, end] -> [0, 1, 1, 0]

  // Beat A: 0 - 20% (0.0 to 0.2)
  const opacityA = useTransform(smoothProgress, [0, 0.05, 0.15, 0.2], [1, 1, 1, 0]); // modified start to 1 so it's visible at start
  const yA = useTransform(smoothProgress, [0, 0.05, 0.15, 0.2], [0, 0, 0, -20]);

  // Beat B: 25 - 45% (0.25 to 0.45)
  const opacityB = useTransform(smoothProgress, [0.25, 0.35, 0.4, 0.45], [0, 1, 1, 0]);
  const yB = useTransform(smoothProgress, [0.25, 0.35, 0.4, 0.45], [20, 0, 0, -20]);

  // Beat C: 50 - 70% (0.50 to 0.70)
  const opacityC = useTransform(smoothProgress, [0.5, 0.6, 0.65, 0.7], [0, 1, 1, 0]);
  const yC = useTransform(smoothProgress, [0.5, 0.6, 0.65, 0.7], [20, 0, 0, -20]);

  // Beat D: 75 - 95% (0.75 to 0.95)
  const opacityD = useTransform(smoothProgress, [0.75, 0.85, 0.95, 1.0], [0, 1, 1, 1]); // keep visible at end
  const yD = useTransform(smoothProgress, [0.75, 0.85, 0.95, 1.0], [20, 0, 0, 0]);

  // Scroll Indicator Fade Out
  const opacityScrollIndicator = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '400vh' }}>

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050505]">

        {/* Loading UI */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
            <div className="text-sm font-mono tracking-widest uppercase mb-4 text-white/60">
              Initializing Premium Scroll Experience
            </div>
            <div className="w-64 h-1 bg-white/10 overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-cyan-400/80 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-4 font-mono text-cyan-400/80 text-xs">
              {progressPercent}%
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain object-center z-0"
        />

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: opacityScrollIndicator }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0 overflow-hidden">
            <div className="w-full h-1/2 bg-white animate-scroll-down" />
          </div>
          <span className="mt-4 text-[10px] tracking-[0.2em] uppercase text-white/40">Scroll to Initiate</span>
        </motion.div>

        {/* Landing Page Branding */}
        <div className="absolute top-8 left-8 md:left-12 z-30 pointer-events-none flex flex-col">
          <Link href="/info" className="pointer-events-auto hover:opacity-80 transition-opacity">
            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              RITIK'S COFFEE SHOP
            </h1>
          </Link>
          <p className="text-white/80 text-xs md:text-sm font-light drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] mt-1">
            welcome to taste the engineer's coffee
          </p>
        </div>

        {/* Text Overlays - Scrollytelling Beats */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center px-8 md:px-24">

          {/* Beat A (0-20%) */}
          <motion.div
            style={{ opacity: opacityA, y: yA }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center"
          >
            <h2 className="text-white text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              CEREMONIAL CRAFT
            </h2>
            <p className="text-white/80 text-lg md:text-2xl font-light tracking-wide max-w-2xl drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Where precision engineering meets the art of the perfect pour.
            </p>
          </motion.div>

          {/* Beat B (25-45%) */}
          <motion.div
            style={{ opacity: opacityB, y: yB }}
            className="absolute left-8 md:left-24 top-1/2 -translate-y-1/2 flex flex-col items-start text-left"
          >
            <h2 className="text-white text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-6 max-w-4xl drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              KINETIC CHILL
            </h2>
            <p className="text-white/80 text-lg md:text-2xl font-light tracking-wide max-w-md drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Crystalline spheres suspended in a moment of absolute freshness.
            </p>
          </motion.div>

          {/* Beat C (50-70%) */}
          <motion.div
            style={{ opacity: opacityC, y: yC }}
            className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex flex-col items-end text-right"
          >
            <h2 className="text-white text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-6 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              VELVET FUSION
            </h2>
            <p className="text-white/80 text-lg md:text-2xl font-light tracking-wide max-w-md drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Dark roast espresso colliding with ceremonial grade matcha.
            </p>
          </motion.div>

          {/* Beat D (75-95%) */}
          <motion.div
            style={{ opacity: opacityD, y: yD }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center"
          >
            <h2 className="text-white text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-8 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              THE ULTIMATE SIP
            </h2>
            <p className="text-white/80 text-lg md:text-2xl font-light tracking-wide mb-12 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Crafted for those who appreciate the anomaly.
            </p>
            <Link href="/order">
              <button className="px-12 py-4 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors rounded-full text-white uppercase tracking-widest text-sm backdrop-blur-sm pointer-events-auto cursor-pointer drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                ORDER THE EXPERIENCE
              </button>
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
