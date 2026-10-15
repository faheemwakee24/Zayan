import CreateStore from "@/components/pages/seller/stores/CreateStore";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function EditStorePage() {
  return (
    <SellerLayout>
      <CreateStore />
    </SellerLayout>
  );
}

