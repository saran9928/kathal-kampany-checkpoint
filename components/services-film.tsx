'use client';
import { useLayoutEffect, useRef, useState } from 'react';

export default function ServicesFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useLayoutEffect(() => {
    const player = video.current; if (!player) return;
    const rect = player.getBoundingClientRect();
    let visible = rect.bottom > 0 && rect.top < window.innerHeight;
    player.muted = true;
    player.defaultMuted = true;
    player.playsInline = true;
    player.controls = false;
    player.setAttribute('muted', '');
    player.setAttribute('playsinline', '');
    player.setAttribute('webkit-playsinline', 'true');
    player.src = '/videos/services-event.mp4';
    player.load();
    const sync = () => {
      if (visible && !document.hidden) {
        player.muted = true;
        void player.play().catch(() => {});
      }
      else player.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .1 });
    const watchdog = window.setInterval(sync, 1200);
    observer.observe(player); player.addEventListener('canplay', sync); player.addEventListener('loadeddata', sync); document.addEventListener('visibilitychange', sync); window.addEventListener('pageshow', sync); window.addEventListener('focus', sync); window.addEventListener('scroll', sync, { passive: true });
    sync();
    return () => { window.clearInterval(watchdog); observer.disconnect(); player.removeEventListener('canplay', sync); player.removeEventListener('loadeddata', sync); document.removeEventListener('visibilitychange', sync); window.removeEventListener('pageshow', sync); window.removeEventListener('focus', sync); window.removeEventListener('scroll', sync); player.pause(); };
  }, []);
  return <div className="services-photo services-film"><video ref={video} autoPlay muted loop playsInline preload="auto" aria-label="Services event film" onError={() => setFailed(true)}/>{failed && <p className="services-film-status">Unable to load film. Please refresh.</p>}</div>;
}
