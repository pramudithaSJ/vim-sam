import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, Dancing_Script } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['400', '700'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  style: ['normal', 'italic'],
  weight: ['300', '400'],
  display: 'swap',
})

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  weight: ['400', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Congratulations Vimukthi & Samadhi! ♡',
  description: 'A special gift from your friends — with love and a little mischief.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cormorant.variable} ${dancing.variable}`}>
        {children}
      </body>
    </html>
  )
}
