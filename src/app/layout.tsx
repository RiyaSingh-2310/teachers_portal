import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { APP_NAME } from "@/config/app";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: "Teacher portal for the school ERP. Demonstration data is not loaded from the school server.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
