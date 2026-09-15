'use client';
import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/motion-provider';

export default function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { calm } = useMotion();
  useEffect(() => {
    const el = root.current; if (!el || calm) return;
    el.classList.add('reveal-ready');
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('reveal-visible'); observer.disconnect(); } }, { threshold: .12 });
    observer.observe(el); return () => observer.disconnect();
  }, [calm]);
  return <div ref={root} className={`reveal ${className}`}>{children}</div>;
}
