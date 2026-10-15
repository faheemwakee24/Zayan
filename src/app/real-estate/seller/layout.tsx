import RouteProtection from "@/components/RouteProtection";

export default function RealEstateSellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteProtection requiredRole="realEstateSeller">
      {children}
    </RouteProtection>
  );
}

