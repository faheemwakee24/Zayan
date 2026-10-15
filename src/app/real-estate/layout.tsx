import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RealeState - Premium Real Estate Platform",
  description: "Premium real estate platform for buyers and sellers across the USA",
};

export default function RealEstateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

