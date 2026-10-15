import SellerProfile from "@/components/pages/seller/SellerProfile";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerProfilePage() {
  return (
    <SellerLayout>
      <SellerProfile />
    </SellerLayout>
  );
}

