import type { Metadata } from 'next';
import './globals.css';
import { MotionProvider } from '@/components/motion-provider';

export const metadata: Metadata = {
  title: 'The Kathal Kampany — Relive your day forever',
  description: 'Weddings, corporate events, photography and cinematic films. A journey from the moment to the memory, with The Kathal Kampany.',
  icons: { icon: '/images/logo.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
