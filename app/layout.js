import './globals.css'
import { Space_Grotesk, Source_Serif_4 } from 'next/font/google'

const displayFont = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
})

const bodyFont = Source_Serif_4({
  variable: '--font-body',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Urban Rooftop Network',
  description: 'Grow food. Build community. Go green.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} bg-gray-50 text-gray-900 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}