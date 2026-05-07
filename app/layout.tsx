import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Direct Your Life',
  description: 'A cinematic AI-powered psychological interactive experience',
  openGraph: {
    title: 'Direct Your Life',
    description: 'The story understands you too well.',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Direct Your Life',
    description: 'The story understands you too well.',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${cormorant.variable} bg-black text-neutral-200 font-sans`}>
        {children}
      </body>
    </html>
  );
}
