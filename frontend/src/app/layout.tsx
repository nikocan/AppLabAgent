'use client'

import { Box } from '@chakra-ui/react'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const metadata = {
  title: "AppLab Agent",
  description: "AI Powered Application Development Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <Box as="main" minH="calc(100vh - 72px)">
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  )
}
