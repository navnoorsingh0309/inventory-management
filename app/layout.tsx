import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "@/components/layout/Navbar";
import { Provider } from "@/components/ui/provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Toaster } from "@/components/ui/toaster";
import { currentUser } from "@clerk/nextjs/server";
import AnimatedBackground from "@/components/AnimatedBackground";
// import StoreProvider from "./StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Management Portal",
  description: "BoST, IIT Ropar",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  return (
    // <StoreProvider>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <Provider>
              <NavBar
                superAdmin={process.env.SUPER_ADMIN!}
                email={user?.primaryEmailAddress?.emailAddress ?? ""}
                firstName={user?.firstName ?? ""}
              />
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              <AnimatedBackground/>
              {children}
              <Toaster />
            </Provider>
          </body>
        </html>
      </ClerkProvider>
    // </StoreProvider>
  );
}
