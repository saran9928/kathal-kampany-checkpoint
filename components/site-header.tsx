import { ArrowUpRight } from 'lucide-react';
import { WHATSAPP_URL } from '@/lib/brand';

export default function SiteHeader({ active = 'experience' }: { active?: 'experience' | 'services' }) {
  return <header className="site-header">
    <a className="brand" href="/" aria-label="The Kaathal Kampany home"><span className="brand-mark" aria-hidden="true"><img src="/images/kathal-transparent-logo.png" alt="" width="1147" height="2048"/></span><span>THE KAATHAL<br/><b>KAMPANY</b></span></a>
    <nav className="main-nav" aria-label="Main navigation"><a href="/" aria-current={active === 'experience' ? 'page' : undefined}>Experience</a><a href="/services" aria-current={active === 'services' ? 'page' : undefined}>Services</a><a href="/services#contact">Contact</a></nav>
    <a className="header-talk" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Let’s talk on WhatsApp">Let’s talk <ArrowUpRight size={17}/></a>
  </header>;
}
