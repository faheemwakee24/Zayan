import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ReduxProviderWrapper } from "@/components/ReduxWrapperProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zayan - Multi-vendor Ecommerce Marketplace",
  description: "Connecting buyers and sellers in one beautiful marketplace",
  icons: {
    icon: "/Images/mainlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ReduxProviderWrapper>
          <Providers>{children}</Providers>
        </ReduxProviderWrapper>
      </body>
    </html>
  );
}
