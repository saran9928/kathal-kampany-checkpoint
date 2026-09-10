'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Pause, Play } from 'lucide-react';
import CameraExperience from '@/components/camera-experience';
import { Button } from '@/components/ui/button';

export default function Home() {
  const main = useRef<HTMLElement>(null);
  const [calm, setCalm] = useState(false);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    setCalm(preference.matches);
    const change = () => setCalm(preference.matches);
    preference.addEventListener('change', change);
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
      frame = 0;
      const vh = innerHeight;
      let active = 0;
      scenes.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - vh)));
        el.style.setProperty('--progress', calm ? '0' : String(p));
        if (rect.top < vh * .45) active = i;
      });
      setChapter(active);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    }), { threshold: .12 });
    main.current?.querySelectorAll('.reveal').forEach(e => observer.observe(e));
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); paint();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, [calm]);
  return <main ref={main} className={calm ? 'calm' : ''} id="top" onPointerMove={event=>{
    if(calm||event.pointerType!=='mouse')return;
    const scene=(event.target as HTMLElement).closest<HTMLElement>('.chapter');
    if(!scene)return;
    const box=scene.getBoundingClientRect();
    scene.style.setProperty('--pointer-x',String((event.clientX-box.left)/box.width-.5));
    scene.style.setProperty('--pointer-y',String(event.clientY/innerHeight-.5));
  }} onPointerLeave={()=>main.current?.querySelectorAll<HTMLElement>('.chapter').forEach(scene=>{scene.style.setProperty('--pointer-x','0');scene.style.setProperty('--pointer-y','0');})}>
    <a className="skip-link" href="#craft">Skip to services</a>
    <header className="header">
      <a className="brand" href="#top"><img src="/images/logo.png" alt="" width="56" height="56" /><span>THE KATHAL KAMPANY</span></a>
      <nav aria-label="Main navigation"><a href="#moment">Experience</a><a href="#craft">Our craft</a></nav>
      <a className="header-contact" href="#contact">Let’s talk <ArrowUpRight size={17} /></a>
    </header>
    <nav className={`chapter-nav ${chapter===1?'on-dark':''}`} aria-label="Story chapters">{['moment','feeling','memory'].map((id,i)=><a key={id} href={`#${id}`} aria-label={`Chapter ${i+1}: ${id}`} aria-current={chapter===i?'step':undefined}><span>0{i+1}</span><i /></a>)}</nav>
    <Button variant="outline" className={`motion-control ${chapter===1?'on-dark':''}`} onClick={()=>setCalm(!calm)} aria-pressed={calm} aria-label={calm?'Enable immersive motion':'Reduce motion'}>{calm?<Play size={13}/>:<Pause size={13}/>}<span>{calm?'Motion off':'Motion on'}</span></Button>
    <section id="moment" className="chapter moment" aria-labelledby="moment-title"><div className="chapter-pin">
      <div className="portal-art"><img src="/images/portal.webp" alt="Layered burgundy wedding arches with flowing ivory silk, flowers and a couple at sunset" fetchPriority="high" width="1536" height="1024" /></div>
      <div className="moment-wash" aria-hidden="true" />
      <div className="moment-copy"><p className="eyebrow">01 / MAKE THE MOMENT</p><h1 id="moment-title">A day worth<br />feeling <em>forever.</em></h1><p className="lede">Weddings. Corporate events. Celebrations.</p><a className="button" href="#feeling">Enter the story <ArrowUpRight size={19}/></a></div>
      <a href="#feeling" className="scroll-note"><span className="scroll-line"/><span>SCROLL TO UNFOLD</span><ArrowDown size={15}/></a>
      <div className="moment-bottom"><span>THE CELEBRATION KAMPANY</span><span>A LITTLE KATHAL. A LOT OF FEELING.</span></div>
      <div className="moment-curtain" aria-hidden="true"/>
    </div></section>
    <section id="feeling" className="chapter feeling" aria-labelledby="feeling-title"><div className="chapter-pin">
      <div className="feeling-copy"><p className="eyebrow">02 / CAPTURE THE FEELING</p><h2 id="feeling-title">Every layer.<br />All the <em>emotion.</em></h2><p className="lede">Photography · Films · 360° · Drone</p></div>
      <CameraExperience calm={calm}/>
      <div className="camera-footer"><span>THE FRAME KAMPANY</span><a href="#memory">KEEP THE FEELING <ArrowDown size={15}/></a></div>
    </div></section>
    <section id="memory" className="chapter memory" aria-labelledby="memory-title"><div className="chapter-pin memory-pin">
      <div className="album-art"><img src="/images/album.webp" alt="An open fine-art album with wedding photographs and turning pages" width="1536" height="1024" loading="lazy" /></div>
      <div className="memory-copy"><p className="eyebrow">03 / KEEP THE STORY</p><h2 id="memory-title">Relive your day<br /><em>forever.</em></h2><p className="lede">Cinematic films. Beautiful albums.</p><a className="button" href="#contact">Let’s make your story <ArrowUpRight size={19}/></a></div>
      <div className="album-caption"><span>THE FOREVER KAMPANY</span><span>A STORY YOU CAN HOLD.</span></div>
    </div></section>
    <section id="craft" className="craft" aria-label="Our services"><div className="craft-heading reveal"><p className="eyebrow">THREE KINDS OF MAGIC. ONE KAMPANY.</p><h2>From the first idea.<br />To the <em>final frame.</em></h2></div><div className="service-grid">
      <article className="service reveal"><span className="eyebrow">01 / THE CELEBRATION KAMPANY</span><h3>Create the day.</h3><p>Thoughtful planning. Seamless production. A celebration with your name on it.</p><ul><li>Weddings & receptions</li><li>Corporate events</li><li>Parties & milestone celebrations</li></ul></article>
      <article className="service reveal"><span className="eyebrow">02 / THE FRAME KAMPANY</span><h3>Capture the feeling.</h3><p>Quiet details to sweeping perspectives. Your story, seen from every side.</p><ul><li>Photography & videography</li><li>360° videography</li><li>Drone & aerial films</li></ul></article>
      <article className="service reveal"><span className="eyebrow">03 / THE FOREVER KAMPANY</span><h3>Keep it forever.</h3><p>More than a record of the day. Films and albums that take you right back.</p><ul><li>Cinematic films & creative editing</li><li>Post-production</li><li>Custom-designed photo albums</li></ul></article>
    </div></section>
    <footer id="contact" className="contact"><p className="eyebrow">PEOPLE × MOMENTS × FOREVER</p><h2>Your next chapter.<br /><em>Our favourite story.</em></h2><p>Weddings, milestones, and everything worth remembering.</p><a className="button" href="/kathal-story-brief.txt" download>Plan your moment <ArrowUpRight size={19}/></a><p className="contact-note">Download your event brief. Contact details will be connected before launch.</p><div className="footer-brand"><span/><a href="#top">THE KATHAL KAMPANY</a><span/></div><div className="footer-base"><span>© {new Date().getFullYear()} The Kathal Kampany</span><span>Relive your day forever.</span><a href="#top">Back to the beginning ↑</a></div></footer>
  </main>;
}
