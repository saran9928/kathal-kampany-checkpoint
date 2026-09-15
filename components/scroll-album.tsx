'use client';
import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/motion-provider';
export default function ScrollAlbum() {
  const root = useRef<HTMLDivElement>(null);
  const { calm } = useMotion();
  useEffect(() => {
    if (!root.current || calm) return;
    const element = root.current;
    const pages = Array.from(element.querySelectorAll<HTMLElement>('.automatic-album-leaf'));
    let frame = 0, visible = false, elapsed = 0, last = 0;
    const ease = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };
    function paint(now: number) {
      frame = 0;
      if (!visible || document.hidden) { last = 0; return; }
      if (last) elapsed += Math.min((now - last) / 1000, .2);
      last = now;
      const time = elapsed % 32;
      pages.forEach((page, i) => {
        const forward = ease((time - 2 - i * 3) / 2.6);
        const backward = ease((time - 18 - (3 - i) * 3) / 2.6);
        const turn = forward - backward;
        page.style.transform = 'rotateY(' + (-168 * turn) + 'deg) rotateZ(' + (-2 * Math.sin(turn * Math.PI)) + 'deg)';
        page.style.zIndex = String(turn > .01 && turn < .99 ? 20 : turn >= .99 ? i + 5 : 4 - i);
        page.style.filter = 'brightness(' + (1 - .14 * Math.sin(turn * Math.PI)) + ')';
      });
      frame = requestAnimationFrame(paint);
    }
    function resume() { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(paint); }
    function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; } else resume(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume(); else { cancelAnimationFrame(frame); frame = 0; last = 0; }
    }, { threshold: .1 });
    observer.observe(element); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); pages.forEach(page => { page.style.transform = ''; }); };
  }, [calm]);
  return <div ref={root} className="album-art original-album"><div className="album-photo-stage"><img src="/images/album.webp" alt="Fine-art album with four pages turning automatically to the left and back to the right" width="1536" height="1024" loading="lazy"/>{!calm && [0,1,2,3].map(i => <div className="automatic-album-leaf" key={i} aria-hidden="true"><img src="/images/album.webp" alt="" width="1536" height="1024" loading="lazy"/>{i < 3 && <img className="album-page-photograph" src={['/images/portal.webp', '/images/drone-event-detail.png', '/images/services-event.webp'][i]} alt="" loading="lazy"/>}</div>)}</div></div>;
}
