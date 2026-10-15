import { use } from "react";
import SellerPropertyDetail from "@/RealEstate/pages/seller/PropertyDetail";

export const dynamic = 'force-dynamic';

export default function SellerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SellerPropertyDetail propertyId={id} />;
}

