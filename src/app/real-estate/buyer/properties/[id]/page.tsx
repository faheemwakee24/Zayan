import PropertyDetail from "@/RealEstate/pages/buyer/PropertyDetail";

export const dynamic = 'force-dynamic';

export default async function BuyerPropertyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return <PropertyDetail propertyId={id} />;
}

