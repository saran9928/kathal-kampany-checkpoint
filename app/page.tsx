'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Pause, Play } from 'lucide-react';
import CameraExperience from '@/components/camera-experience';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const services = [
  { name: 'THE CELEBRATION KAMPANY', title: 'Create the day.', description: 'Thoughtful planning. Seamless production. A celebration with your name on it.', items: ['Weddings & receptions', 'Corporate events', 'Parties & milestone celebrations'] },
  { name: 'THE FRAME KAMPANY', title: 'Capture the feeling.', description: 'Quiet details to sweeping perspectives. Your story, seen from every side.', items: ['Photography & videography', '360° videography', 'Drone & aerial films'] },
  { name: 'THE FOREVER KAMPANY', title: 'Keep it forever.', description: 'Films and albums that take you right back.', items: ['Cinematic films & creative editing', 'Post-production', 'Custom-designed photo albums'] },
];
export default function Home() {
  const main = useRef<HTMLElement>(null);
  const [calm, setCalm] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [service, setService] = useState<number | null>(null);
  const [contact, setContact] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setCalm(preference.matches);
    change(); preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('quiet-motion', calm);
    return () => document.documentElement.classList.remove('quiet-motion');
  }, [calm]);
  useEffect(() => {
    let frame = 0;
    const scenes = Array.from(main.current?.querySelectorAll<HTMLElement>('.chapter') ?? []);
    const paint = () => {
      frame = 0; let active = 0;
      scenes.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight * .65 - rect.top) / (innerHeight * .5 + rect.height)));
        el.style.setProperty('--progress', calm ? '0' : String(p));
        if (rect.top < innerHeight * .35) active = i;
      });
      setChapter(active);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); paint();
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, [calm]);
  return <>
    <main ref={main} className={calm ? 'calm' : ''} id="top" onPointerMove={event => {
      if (calm || event.pointerType !== 'mouse') return;
      const scene = (event.target as HTMLElement).closest<HTMLElement>('.chapter');
      if (!scene) return;
      const box = scene.getBoundingClientRect();
      scene.style.setProperty('--pointer-x', String((event.clientX - box.left) / box.width - .5));
      scene.style.setProperty('--pointer-y', String((event.clientY - box.top) / box.height - .5));
    }} onPointerLeave={() => main.current?.querySelectorAll<HTMLElement>('.chapter').forEach(scene => {
      scene.style.setProperty('--pointer-x', '0'); scene.style.setProperty('--pointer-y', '0');
    })}>
      <a className="skip-link" href="#craft">Skip to services</a>
      <header className="header">
        <a className="brand" href="#top"><img src="/images/logo.png" alt="" width="68" height="68" /><span>THE KATHAL KAMPANY</span></a>
        <nav aria-label="Main navigation"><a href="#moment">Experience</a><a href="#craft">Our craft</a></nav>
        <Button variant="ghost" className="header-contact" onClick={() => setContact(true)}>Let’s talk <ArrowUpRight size={17}/></Button>
      </header>
      <section id="moment" className="chapter moment" aria-labelledby="moment-title">
        <div className="moment-surface"><div className="portal-art"><img src="/images/portal.webp" alt="Burgundy wedding arches, flowing silk and white flowers frame a couple at sunset" width="1536" height="1024" fetchPriority="high"/></div><div className="moment-wash" aria-hidden="true"/></div>
        <div className="moment-copy"><p className="eyebrow">01 / MAKE THE MOMENT</p><h1 id="moment-title"><span>A day worth</span><span>feeling forever.</span></h1><p className="lede">Weddings. Corporate events. Celebrations.</p><a className="button" href="#feeling">Enter the story <ArrowUpRight size={17}/></a></div>
        <a href="#feeling" className="scroll-note"><span className="scroll-stem"><i/><ArrowDown size={17}/></span><span>SCROLL TO UNFOLD</span></a>
        <nav className="chapter-nav" aria-label="Story chapters">{['moment', 'feeling', 'memory'].map((id, i) => <a key={id} href={`#${id}`} aria-label={`Chapter ${i + 1}: ${id}`} aria-current={chapter === i ? 'step' : undefined}><span>0{i + 1}</span>{i < 2 && <i/>}</a>)}</nav>
      </section>
      <section id="feeling" className="chapter feeling" aria-labelledby="feeling-title">
        <div className="feeling-copy"><p className="eyebrow">02 / CAPTURE THE FEELING</p><h2 id="feeling-title"><span>Every layer.</span><span>All the emotion.</span></h2><p className="lede">Photography · Films · 360° · Drone</p></div>
        <CameraExperience calm={calm}/>
        <div className="camera-label label-picture" aria-hidden="true"><i/><span>THE BIG PICTURE</span></div>
        <div className="camera-label label-detail" aria-hidden="true"><i/><span>THE DETAIL</span></div>
        <svg className="optical-trace" viewBox="0 0 1000 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="trace"><stop stopColor="#f6dca4" stopOpacity="0"/><stop offset=".6" stopColor="#f6dca4"/><stop offset=".85" stopColor="#ffefc9"/><stop offset="1" stopColor="#b18acd" stopOpacity=".5"/></linearGradient></defs><path d="M-20 140 C220 24 360 210 540 110 S830 -18 1020 122"/><path d="M-20 147 C220 31 360 220 540 117 S830 -28 1020 140"/><path d="M-20 151 C220 42 360 230 540 125 S830 -36 1020 149"/></svg>
      </section>
      <section id="memory" className="chapter memory" aria-labelledby="memory-title">
        <svg className="memory-wave" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 42 C180 -52 355 125 551 61 S862 -7 1000 70 L1000 90 L0 90Z"/></svg>
        <div className="album-art"><img src="/images/album.webp" alt="An open fine-art album of wedding, celebration and corporate-event photographs" width="1536" height="1024" loading="lazy"/></div>
        <div className="memory-copy"><p className="eyebrow">03 / KEEP THE STORY</p><h2 id="memory-title">Relive your day<br/>forever.</h2><p className="lede">Cinematic films. Beautiful albums.</p><Button className="button" onClick={() => setContact(true)}>Let’s make your story <ArrowUpRight size={17}/></Button></div>
      </section>
      <footer className="footer">
        <nav id="craft" className="service-nav" aria-label="Explore our services">{services.map((item, i) => <Button variant="ghost" key={item.name} className="service-link" onClick={() => setService(i)}>{item.name}<i/></Button>)}</nav>
        <div className="footer-brand"><span/><a href="#top">THE KATHAL KAMPANY</a><span/></div><p className="footer-tagline">PEOPLE × MOMENTS × FOREVER</p>
        <Button variant="ghost" className="motion-control" onClick={() => setCalm(!calm)} aria-pressed={calm} aria-label={calm ? 'Enable immersive motion' : 'Reduce motion'}>{calm ? <Play size={12}/> : <Pause size={12}/>}<span>{calm ? 'Motion off' : 'Motion on'}</span></Button>
      </footer>
    </main>
    <Dialog open={service !== null} onOpenChange={open => { if (!open) setService(null); }}><DialogContent className="story-dialog"><p className="eyebrow">{service !== null ? services[service].name : 'OUR CRAFT'}</p><DialogTitle className="dialog-title">{service !== null ? services[service].title : 'Our craft'}</DialogTitle><DialogDescription>{service !== null ? services[service].description : ''}</DialogDescription><ul className="service-list">{service !== null && services[service].items.map(item => <li key={item}>{item}</li>)}</ul><Button className="button" onClick={() => { setService(null); setContact(true); }}>Let’s make your story <ArrowUpRight size={17}/></Button></DialogContent></Dialog>
    <Dialog open={contact} onOpenChange={setContact}><DialogContent className="story-dialog"><p className="eyebrow">THE KATHAL KAMPANY</p><DialogTitle className="dialog-title">Your story starts here.</DialogTitle><DialogDescription>Plan the date, the place, and the moments that matter.</DialogDescription><a className="button" href="/kathal-story-brief.txt" download>Download your event brief <ArrowDown size={17}/></a><p className="contact-note">Contact details will be connected before launch. This brief saves to your device; it does not send an enquiry.</p></DialogContent></Dialog>
  </>;
}
