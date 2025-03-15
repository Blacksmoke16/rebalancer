import { Container } from '@mui/material';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Rebalancer',
    description: 'Assists in re-balancing your portfolio',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <head>
            <meta name="viewport" content="initial-scale=1, width=device-width"/>
        </head>

        <body className={inter.className}>
            <Container>
                {children}
            </Container>
        </body>
        </html>
    );
}
