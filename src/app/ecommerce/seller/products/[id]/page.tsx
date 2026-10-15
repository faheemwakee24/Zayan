import SellerProductDetail from "@/components/pages/seller/products/ProductDetail";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function SellerProductDetailPage() {
  return (
    <SellerLayout>
      <SellerProductDetail />
    </SellerLayout>
  );
}

