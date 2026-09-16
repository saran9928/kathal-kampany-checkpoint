import { DISPLAY_PHONE, WHATSAPP_URL } from '@/lib/brand';

export default function SiteFooter() {
  return <footer className="site-footer"><div className="footer-signature"><span>THE KAATHAL KAMPANY</span><p>Relive your day forever.</p></div><div className="footer-links"><a href="/services">Our services</a><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{DISPLAY_PHONE}</a></div></footer>;
}
