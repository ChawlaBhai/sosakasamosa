import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Alex_Brush, DM_Sans } from "next/font/google";
import clsx from "clsx";
import "./globals.css";
import CatCursor from '@/components/CatCursor';

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-heading",
    display: "swap",
});

const alexBrush = Alex_Brush({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-script",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

export const metadata: Metadata = {
    title: 'SoSaKaSamosa',
    description: 'A digital space for our memories and future',
};

export const viewport: Viewport = {
    // Prevent auto-zoom on mobile inputs
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(instrumentSerif.variable, alexBrush.variable, dmSans.variable)}>
                <CatCursor />
                {children}
            </body>
        </html>
    );
}
