import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const fontSans = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'SuperMart - Online Shopping',
  description: 'Best online shopping site',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  )
}
