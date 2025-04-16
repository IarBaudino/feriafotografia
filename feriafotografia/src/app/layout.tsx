import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Feria Fotografía',
  description: 'Feria de fotografía - Un espacio de encuentro para amantes de la fotografía',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} bg-bg-primary text-text-primary`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
} 