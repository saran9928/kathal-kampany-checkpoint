'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { enquiryText, enquiryUrl, type Enquiry } from '@/lib/brand';

const empty: Enquiry = { name: '', occasion: '', date: '', location: '', message: '' };
export default function ContactForm() {
  const [values, setValues] = useState<Enquiry>(empty);
  const [draft, setDraft] = useState<Enquiry | null>(null);
  const [error, setError] = useState('');
  const update = (key: keyof Enquiry, value: string) => { setValues(previous => ({ ...previous, [key]: value })); setDraft(null); setError(''); };
  return <form className="contact-form" onSubmit={event => {
    event.preventDefault();
    if (!values.name.trim() || !values.message.trim() || !values.occasion) { setError('Please add your name, occasion, and a little about your plans.'); return; }
    setError(''); setDraft({ ...values });
  }}>
    <div className="form-row"><Field><FieldLabel htmlFor="enquiry-name">Your name *</FieldLabel><Input id="enquiry-name" name="name" autoComplete="name" required maxLength={100} placeholder="How should we call you?" value={values.name} onChange={e => update('name', e.target.value)}/></Field><Field><FieldLabel htmlFor="enquiry-occasion">The occasion *</FieldLabel><NativeSelect id="enquiry-occasion" name="occasion" required value={values.occasion} onChange={e => update('occasion', e.target.value)}><NativeSelectOption value="">Choose your occasion</NativeSelectOption>{['A wedding', 'A corporate event', 'A celebration', 'Photography & videography', 'A cinematic film or album'].map(item => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect></Field></div>
    <div className="form-row"><Field><FieldLabel htmlFor="enquiry-date">Date <span>(optional)</span></FieldLabel><Input id="enquiry-date" name="date" type="date" value={values.date} onChange={e => update('date', e.target.value)}/></Field><Field><FieldLabel htmlFor="enquiry-location">City or venue <span>(optional)</span></FieldLabel><Input id="enquiry-location" name="location" autoComplete="address-level2" maxLength={180} placeholder="Where is the story happening?" value={values.location} onChange={e => update('location', e.target.value)}/></Field></div>
    <Field><FieldLabel htmlFor="enquiry-message">Tell us a little about it *</FieldLabel><Textarea id="enquiry-message" name="message" required maxLength={2000} rows={3} placeholder="The idea, the atmosphere, the details you have in mind…" value={values.message} onChange={e => update('message', e.target.value)}/></Field>
    {error && <p className="form-error" role="alert">{error}</p>}
    <Button type="submit" className="button cream">Prepare WhatsApp message <ArrowUpRight size={17}/></Button>
    <p className="form-note">Your details stay here until you open WhatsApp. Nothing is sent automatically.</p>
    {draft && <div className="whatsapp-draft" role="status"><h3>Your message is ready.</h3><p className="draft-text">{enquiryText(draft)}</p><a className="button cream" href={enquiryUrl(draft)} target="_blank" rel="noopener noreferrer">Continue on WhatsApp <ArrowUpRight size={17}/></a><p className="form-note">Review it in WhatsApp, then tap Send to reach us.</p></div>}
  </form>;
}
