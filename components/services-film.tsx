'use client';
import { useEffect, useRef, useState } from 'react';

export default function ServicesFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
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
    observer.observe(player); player.addEventListener('canplay', sync); player.addEventListener('loadeddata', sync); document.addEventListener('visibilitychange', sync); window.addEventListener('pageshow', sync);
    return () => { observer.disconnect(); player.removeEventListener('canplay', sync); player.removeEventListener('loadeddata', sync); document.removeEventListener('visibilitychange', sync); window.removeEventListener('pageshow', sync); player.pause(); };
  }, []);
  return <div className="services-photo services-film"><video ref={video} src="/videos/services-event.mp4" autoPlay muted loop playsInline preload="auto" aria-label="Services event film" onError={() => setFailed(true)}/>{failed && <p className="services-film-status">Unable to load film. Please refresh.</p>}</div>;
}
