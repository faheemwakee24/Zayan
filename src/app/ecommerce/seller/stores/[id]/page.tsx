import SellerStoreDetail from "@/components/pages/seller/stores/StoreDetail";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function SellerStoreDetailPage() {
  return (
    <SellerLayout>
      <SellerStoreDetail />
    </SellerLayout>
  );
}

