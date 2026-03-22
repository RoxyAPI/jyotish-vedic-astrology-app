import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Jyotish - Vedic Astrology Kundli App | RoxyAPI Starter',
    template: '%s | Jyotish',
  },
  description:
    'Free open-source Vedic astrology app with Kundli generator, Panchang, Ashtakoot Gun Milan, Vimshottari Dasha, dosha detection, and planetary transits. Built with Next.js and RoxyAPI Vedic Astrology API.',
  keywords: [
    'vedic astrology', 'kundli', 'kundali', 'birth chart', 'panchang',
    'gun milan', 'ashtakoot', 'vimshottari dasha', 'manglik dosha',
    'kalsarpa dosha', 'sade sati', 'jyotish', 'vedic astrology API',
    'astrology app', 'RoxyAPI',
  ],
  authors: [{ name: 'RoxyAPI', url: 'https://roxyapi.com' }],
  openGraph: {
    title: 'Jyotish - Vedic Astrology Kundli App',
    description: 'Free Vedic astrology starter with Kundli, Panchang, compatibility matching, and Dasha analysis. Powered by RoxyAPI.',
    url: 'https://github.com/RoxyAPI/jyotish-vedic-astrology-app',
    siteName: 'Jyotish by RoxyAPI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jyotish - Vedic Astrology Kundli App',
    description: 'Free Vedic astrology starter with Kundli, Panchang, compatibility matching, and Dasha analysis. Powered by RoxyAPI.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
            </main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
