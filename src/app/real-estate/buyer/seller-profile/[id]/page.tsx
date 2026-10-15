import SellerProfile from "@/RealEstate/pages/buyer/SellerProfile";

export const dynamic = 'force-dynamic';

export default async function SellerProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <SellerProfile sellerId={id} />;
}

