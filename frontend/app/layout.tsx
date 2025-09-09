import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { AppLayout } from './components/layout/AppLayout';
import { AccessibilityProvider } from './components/ui/AccessibilityProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GitHub Trending Summarizer',
  description:
    'Discover trending GitHub repositories with AI-powered summaries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AccessibilityProvider>
          <ThemeProvider>
            <QueryProvider>
              <AppLayout>{children}</AppLayout>
            </QueryProvider>
          </ThemeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
