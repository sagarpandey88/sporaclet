import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SportsPro - Advanced Sports Prediction Platform',
  description: 'Get accurate sports predictions with advanced analytics, weather data, and historical statistics. Covering football, basketball, tennis and more.',
  keywords: 'sports predictions, betting tips, sports analytics, football predictions, basketball predictions, tennis predictions',
  authors: [{ name: 'SportsPro Team' }],
  openGraph: {
    title: 'SportsPro - Advanced Sports Prediction Platform',
    description: 'Get accurate sports predictions with advanced analytics, weather data, and historical statistics.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportsPro - Advanced Sports Prediction Platform',
    description: 'Get accurate sports predictions with advanced analytics, weather data, and historical statistics.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}