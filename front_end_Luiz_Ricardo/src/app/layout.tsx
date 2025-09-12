"use client"; // Necessário para usar hooks
import { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { useThemeStore } from "@/store/themeStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// A metadata não pode ser exportada de um client component,
// mas podemos defini-la no <head> diretamente.
// export const metadata: Metadata = {
//   title: "Inbox Chatvolt",
//   description: "Gerenciador de conversas",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Esta linha é a chave: aplica a classe 'dark' ou 'light' no body
  const bodyClassName = `${geistSans.variable} antialiased ${isMounted ? theme : ''}`;

  return (
    <html lang="en">
       <head>
        <title>Inbox Chatvolt</title>
        <meta name="description" content="Gerenciador de conversas" />
      </head>
      <body className={bodyClassName}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}