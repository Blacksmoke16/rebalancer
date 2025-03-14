import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StrictMode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Rebalancer',
    description: 'Assists in re-balancing your portfolio',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    );
}
