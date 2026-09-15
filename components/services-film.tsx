'use client';
import { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/components/motion-provider';

export default function ServicesFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const { calm } = useMotion();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const player = video.current; if (!player) return;
    const controller = new AbortController(); let url = '';
    fetch('/videos/services-event.mp4', { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Video unavailable'); return response.blob();
    }).then(blob => { url = URL.createObjectURL(blob); player.src = url; player.load(); }).catch(error => { if (error.name !== 'AbortError') setFailed(true); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, []);
  useEffect(() => {
    const player = video.current; if (!player) return;
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !calm && player.readyState >= 2) player.play().catch(() => {});
      else player.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .1 });
    observer.observe(player); player.addEventListener('canplay', sync); document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); player.removeEventListener('canplay', sync); document.removeEventListener('visibilitychange', sync); player.pause(); };
  }, [calm]);
  return <div className="services-photo services-film"><video ref={video} muted loop playsInline preload="auto" aria-label="Services event film" onError={() => setFailed(true)}/>{failed && <p className="services-film-status">Unable to load film. Please refresh.</p>}</div>;
}
