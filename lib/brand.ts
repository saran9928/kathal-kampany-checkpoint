export const WHATSAPP_NUMBER = '919567931726';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const DEFAULT_WHATSAPP_MESSAGE = `Hello The Kathal Kampany,

I’d love to discuss an upcoming occasion with your team. Please share the details and help me plan the next steps.`;
export const WHATSAPP_URL = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;
export const DISPLAY_PHONE = '+91 95679 31726';
export const services = [
  { id: 'celebration', name: 'Event Management', items: ['Weddings & receptions', 'Corporate events', 'Celebrations'] },
  { id: 'frame', name: 'Photography & Videography', items: ['Photography', 'Videography', '360° videography', 'Drone videography'] },
  { id: 'forever', name: 'Cinematic Films & Albums', items: ['Cinematic video editing', 'Video post-production', 'Photo albums'] },
];

export type Enquiry = { name: string; occasion: string; date: string; location: string; message: string };
export function enquiryText(values: Enquiry) {
  return ['Hello The Kathal Kampany,', '', `I’m ${values.name.trim()}. I’d love to discuss ${values.occasion.toLowerCase()}.`, values.date ? `Preferred date: ${values.date}` : '', values.location.trim() ? `Location: ${values.location.trim()}` : '', '', values.message.trim()].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
}
export function enquiryUrl(values: Enquiry) { return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(enquiryText(values))}`; }
