import SellerCategoryDetail from "@/components/pages/seller/categories/CategoryDetail";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function SellerCategoryDetailPage() {
  return (
    <SellerLayout>
      <SellerCategoryDetail />
    </SellerLayout>
  );
}

