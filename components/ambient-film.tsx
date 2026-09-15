'use client';
import { useEffect, useRef, useState } from 'react';

export default function AmbientFilm({ name, label }: { name: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    let disposed = false, lastTime = -1, stalledAt = Date.now();
    const showFallback = () => {
      if (!disposed) { setFallback(true); setPlaying(false); }
    };
    const attempt = () => {
      if (document.hidden) return;
      player.muted = true;
      player.defaultMuted = true;
      if (player.paused) void player.play().catch(showFallback);
    };
    const onPlaying = () => {
      if (!disposed) { setPlaying(true); stalledAt = Date.now(); }
    };
    player.addEventListener('playing', onPlaying);
    player.addEventListener('error', showFallback);
    player.addEventListener('canplay', attempt);
    document.addEventListener('visibilitychange', attempt);
    window.addEventListener('pageshow', attempt);
    document.addEventListener('touchstart', attempt, { passive: true });
    document.addEventListener('pointerdown', attempt, { passive: true });
    attempt();
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (player.currentTime !== lastTime && !player.paused && player.currentTime > 0) {
        lastTime = player.currentTime;
        stalledAt = Date.now();
        setPlaying(true);
      } else if (Date.now() - stalledAt > 2000) showFallback();
      attempt();
    }, 1000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      player.removeEventListener('playing', onPlaying);
      player.removeEventListener('error', showFallback);
      player.removeEventListener('canplay', attempt);
      document.removeEventListener('visibilitychange', attempt);
      window.removeEventListener('pageshow', attempt);
      document.removeEventListener('touchstart', attempt);
      document.removeEventListener('pointerdown', attempt);
      player.pause();
    };
  }, [name]);
  return <div className="ambient-film" data-playing={playing}>
    {fallback && <img className="ambient-film-fallback" src={`/videos/${name}-motion.webp`} alt="" aria-hidden="true" />}
    <video ref={video} src={`/videos/${name}.mp4`} autoPlay muted loop playsInline preload="auto" controls={false} aria-label={label} />
  </div>;
}
