import type { Metadata } from 'next'
import Script from 'next/script'
import { Bebas_Neue, Manrope, Lora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'El Bocatómetro'
const siteTagline = process.env.NEXT_PUBLIC_SITE_TAGLINE || 'El juicio final del bocadillo'

export const metadata: Metadata = {
  title: { default: `${siteName} — ${siteTagline}`, template: `%s | ${siteName}` },
  description: `Rankings, reviews y juicios inapelables sobre bocadillos.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${bebasNeue.variable} ${manrope.variable} ${lora.variable}`}>
      <head>
        {/*
          Script inline que corre ANTES del primer paint.
          Aplica la clase "dark" al <html> sin esperar a React.
          Esto evita el flash de color incorrecto al cargar.
        */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();`}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: '64px' }}>
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
