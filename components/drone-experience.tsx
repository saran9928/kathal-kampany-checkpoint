'use client';
import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useMotion } from '@/components/motion-provider';

export default function DroneExperience() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { calm } = useMotion();
  useEffect(() => {
    const player = video.current; if (!player) return;
    let visible = false;
    player.muted = true;
    player.defaultMuted = true;
    const sync = () => {
      if (visible && !document.hidden) void player.play().catch(() => {});
      else player.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .1 });
    observer.observe(player); document.addEventListener('visibilitychange', sync); window.addEventListener('pageshow', sync); player.addEventListener('canplay', sync); player.addEventListener('loadeddata', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); window.removeEventListener('pageshow', sync); player.removeEventListener('canplay', sync); player.removeEventListener('loadeddata', sync); player.pause(); };
  }, []);
  useEffect(() => {
    const el = root.current; if (!el) return;
    let frame = 0, current = 0, target = 0;
    const paint = () => {
      frame = 0;
      current += (target - current) * .085;
      if (Math.abs(target - current) < .0005) current = target;
      el.style.setProperty('--flight', String(current));
      if (current !== target && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const update = () => {
      const rect = el.getBoundingClientRect();
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 88;
      target = calm ? 0 : Math.max(0, Math.min(1, (header - rect.top) / Math.max(1, rect.height - innerHeight + header)));
      if (document.hidden || rect.bottom < 0 || rect.top > innerHeight) { cancelAnimationFrame(frame); frame = 0; current = target; el.style.setProperty('--flight', String(current)); return; }
      if (!frame) frame = requestAnimationFrame(paint);
    };
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); document.addEventListener('visibilitychange', update);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', update); removeEventListener('resize', update); document.removeEventListener('visibilitychange', update); };
  }, [calm]);
  return <section ref={root} id="feeling" className="drone-chapter" aria-labelledby="drone-title">
    <div className="drone-pin">
      <div className="drone-image"><video ref={video} src="/videos/live-event.mp4" autoPlay muted loop playsInline preload="auto" aria-label="Live event film"/></div>
      <div className="drone-shade" aria-hidden="true"/>
      <div className="drone-topline"><span className="eyebrow">A DIFFERENT PERSPECTIVE</span></div>
      <div className="drone-copy"><h2 id="drone-title">Live the moment.<br/><em>Feel everything.</em></h2><p>Your people. Your celebration.</p><a className="text-link light" href="/services#frame">Photography, film & aerial stories <ArrowUpRight size={17}/></a></div>
      <div className="drone-bottom"><span className="drone-cue">SCROLL INTO THE MOMENT <ArrowDown size={14}/></span></div>
      <div className="flight-progress" aria-hidden="true"><i/></div>
    </div>
  </section>;
}
