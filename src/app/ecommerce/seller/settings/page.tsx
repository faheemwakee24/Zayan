import SellerSettings from "@/components/pages/seller/SellerSettings";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function SellerSettingsPage() {
  return (
    <SellerLayout>
      <SellerSettings />
    </SellerLayout>
  );
}

