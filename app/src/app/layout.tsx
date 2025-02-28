import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CSPostHogProvider, MixpanelProvider } from './providers';
import { ClerkProvider, SignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { FathomAnalytics } from './fathom';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export const metadata: Metadata = {
  title: "Prompt Prompt Prompt",
  description: "Make development faster",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <CSPostHogProvider>
          <MixpanelProvider>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <FathomAnalytics />
              <main>
                <SignedOut>
                  <div className="flex justify-center pt-16">
                    <SignIn routing="hash" />
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <UserButton />
                    </div>
                    {children}
                  </div>
                </SignedIn>
              </main>
            </body>
          </MixpanelProvider>
        </CSPostHogProvider>
      </html>
    </ClerkProvider>
  );
}
