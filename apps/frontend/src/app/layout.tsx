import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alternance Offer Crawler',
  description: 'Daily automation system for job offer search and validation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
