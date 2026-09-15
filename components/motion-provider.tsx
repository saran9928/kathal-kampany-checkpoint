'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MotionContext = createContext({ calm: false, toggle: () => {} });
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => { let saved: string | null = null; try { saved = localStorage.getItem('kathal-motion'); } catch {} setCalm(saved ? saved === 'quiet' : media.matches); };
    read(); media.addEventListener('change', read);
    return () => media.removeEventListener('change', read);
  }, []);
  useEffect(() => { document.documentElement.dataset.motion = calm ? 'quiet' : 'full'; }, [calm]);
  const toggle = () => { const next = !calm; setCalm(next); try { localStorage.setItem('kathal-motion', next ? 'quiet' : 'full'); } catch {} };
  return <MotionContext.Provider value={{ calm, toggle }}>{children}</MotionContext.Provider>;
}
export const useMotion = () => useContext(MotionContext);
export function MotionToggle() {
  const { calm, toggle } = useMotion();
  return <Button variant="ghost" className="motion-toggle" onClick={toggle} aria-pressed={calm} aria-label={calm ? 'Enable motion' : 'Reduce motion'}>{calm ? <Play size={13}/> : <Pause size={13}/>}<span>{calm ? 'Motion off' : 'Motion on'}</span></Button>;
}
