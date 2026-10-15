import StoresList from "@/components/pages/seller/stores/StoresList";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function StoresListPage() {
  return (
    <SellerLayout>
      <StoresList />
    </SellerLayout>
  );
}

