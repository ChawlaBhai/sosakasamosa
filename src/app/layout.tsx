import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Alex_Brush, DM_Sans } from "next/font/google";
import clsx from "clsx";
import "./globals.css";

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
    title: "SoSaKaSamosa",
    description: "our little world 🌍",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "SoSaKaSamosa",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#C4E0F4", // New Sky Blue Theme
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(instrumentSerif.variable, alexBrush.variable, dmSans.variable)}>
                {children}
            </body>
        </html>
    );
}
