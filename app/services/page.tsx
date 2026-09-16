import type { Metadata } from 'next';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContactForm from '@/components/contact-form';
import ServicesFilm from '@/components/services-film';
import Reveal from '@/components/reveal';
import { services, WHATSAPP_URL, DISPLAY_PHONE } from '@/lib/brand';

export const metadata: Metadata = { title: 'Services & Contact — The Kaathal Kampany', description: 'Event management, photography, 360° and drone videography, cinematic films and albums. Tell The Kaathal Kampany about your next occasion.' };
export default function ServicesPage() {
  return <><SiteHeader active="services"/><main className="services-page"><a className="skip-link" href="#contact">Skip to contact</a>
<section className="services-chapter" aria-labelledby="services-title"><div className="services-intro"><Reveal><p className="eyebrow">01 / OUR CRAFT</p><h1 id="services-title">One Kampany.<br/><em>Every possibility.</em></h1><p className="services-lede">We create the occasion, capture its feeling,<br className="desktop-break"/> and turn it into something you can keep.</p></Reveal><div className="service-rows">{services.map((service, index) => <Reveal key={service.id}><article id={service.id} className="service-row"><span className="service-index">0{index + 1}</span><div><h2>{service.name}</h2><ul>{service.items.map(item => <li key={item}>{item}</li>)}</ul></div></article></Reveal>)}</div></div>
      <div className="services-visual"><ServicesFilm/><div className="services-image-caption"><span>FROM THE FIRST IDEA.</span><span>TO THE FINAL FRAME.</span></div><a className="text-link" href="#contact">Tell us what you’re imagining <ArrowDown size={17}/></a></div>
    </section>
    <section id="contact" className="contact-chapter" aria-labelledby="contact-title" tabIndex={-1}><div className="contact-copy"><Reveal><p className="eyebrow">02 / YOUR NEXT CHAPTER</p><h2 id="contact-title">Good stories<br/>start with<br/><em>a hello.</em></h2><p>A date. An idea. A feeling.<br/>Let’s start there.</p><a className="contact-phone" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{DISPLAY_PHONE}<ArrowUpRight size={22}/></a><span className="contact-channel">TALK TO US ON WHATSAPP</span></Reveal></div><ContactForm/></section>
  </main><SiteFooter/></>;
}
