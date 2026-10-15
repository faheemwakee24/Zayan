import RouteProtection from "@/components/RouteProtection";

export default function EcommerceSellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteProtection requiredRole="ecommerceSeller">
      {children}
    </RouteProtection>
  );
}

