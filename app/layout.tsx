import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { StoreProvider } from "@/context/store-context";
import { LiveChatWidget } from "@/components/live-chat-widget";

export const metadata: Metadata = {
  title: "Atelier — Modern essentials",
  description: "A clean, modern shopping experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <LiveChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
