import SellerEditProfile from "@/components/pages/seller/SellerEditProfile";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerEditProfilePage() {
  return (
    <SellerLayout>
      <SellerEditProfile />
    </SellerLayout>
  );
}

