import type { Metadata } from "next";
import "@/globals.css";

export const metadata: Metadata = {
  title: "GoMile Web",
  description: "Application web GoMile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
