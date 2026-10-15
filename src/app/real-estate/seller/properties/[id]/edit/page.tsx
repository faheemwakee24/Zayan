import { use } from "react";
import SellerAddProperty from "@/RealEstate/pages/seller/AddProperty";

export const dynamic = 'force-dynamic';

export default function SellerEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SellerAddProperty propertyId={id} />;
}


