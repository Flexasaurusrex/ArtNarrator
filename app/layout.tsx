import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArtNarrator - AI Video Essay Creator',
  description: 'Create stunning video essays with on-screen narration, elegant typography, and cinematic effects.',
  keywords: ['video essay', 'narration', 'AI', 'video creation', 'storytelling'],
  authors: [{ name: 'ArtNarrator Team' }],
  openGraph: {
    title: 'ArtNarrator - AI Video Essay Creator',
    description: 'Create stunning video essays with AI-powered tools',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
