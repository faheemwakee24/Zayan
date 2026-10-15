import { Providers } from "@/components/Providers";

export default function EcommerceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>{children}</Providers>
  );
}
