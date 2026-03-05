import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Using standard system fonts instead of Google Fonts for maximum reliability on all environments.
const inter = { variable: "font-inter" }; // Placeholder for tailwind variable

export const metadata: Metadata = {
  title: "ClinixPro - Professional Clinic Management",
  description: "Complete healthcare management platform for modern clinics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
