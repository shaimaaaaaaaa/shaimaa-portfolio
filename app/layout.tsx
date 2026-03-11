import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shaimaa Kalel | Software Engineer",
  description: "Software Engineer & Content Creator. Combining Technical Skills with an Agile Mindset to build real systems that serve real people.",
  keywords: "Shaimaa Kalel, Software Engineer, Agile, Portfolio, Abu Dhabi",
  authors: [{ name: "Shaimaa Kalel" }],
  openGraph: {
    title: "Shaimaa Kalel | Software Engineer",
    description: "Software Engineer & Content Creator based in Abu Dhabi.",
    url: "https://shaimaa-portfolio.vercel.app",
    siteName: "Shaimaa Kalel",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}