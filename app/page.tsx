import { ArrowUpRight, ArrowDown } from 'lucide-react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import DroneExperience from '@/components/drone-experience';
import ScrollAlbum from '@/components/scroll-album';
import WindPortal from '@/components/wind-portal';
import Reveal from '@/components/reveal';
import { services } from '@/lib/brand';

export default function Home() {
  return <><SiteHeader/><main className="home-page" id="top"><a className="skip-link" href="/services">Skip to services</a>
<section id="moment" className="moment" aria-labelledby="moment-title"><WindPortal/><div className="moment-wash" aria-hidden="true"/><div className="moment-copy"><p className="eyebrow">MAKE THE MOMENT</p><h1 id="moment-title">A day worth<br/>feeling <em>forever.</em></h1><p>Weddings. Corporate events. Celebrations.</p><a className="button" href="#feeling">Enter the experience <ArrowUpRight size={17}/></a></div><a className="scroll-note" href="#feeling"><ArrowDown size={16}/><span>THE STORY CONTINUES</span></a></section>
    <DroneExperience/>
<section id="memory" className="memory" aria-labelledby="memory-title"><ScrollAlbum/><Reveal className="memory-copy"><p className="eyebrow">KEEP THE STORY</p><h2 id="memory-title">Relive your day<br/><em>forever.</em></h2><p>Cinematic films. Beautiful albums.<br/>The feeling, all over again.</p><a className="button" href="/services#contact">Let’s make your story <ArrowUpRight size={17}/></a></Reveal></section>
    <nav id="craft" className="craft-links" aria-label="Explore our services">{services.map((service, i) => <a href={`/services#${service.id}`} key={service.id}><span className="eyebrow">0{i + 1}</span><span>{service.name}</span><ArrowUpRight size={17}/></a>)}</nav>
  </main><SiteFooter/></>;
}
