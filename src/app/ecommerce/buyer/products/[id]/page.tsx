import ProductDetailPage from "@/components/pages/buyer/ProductDetailPage";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function ProductDetailPageRoute() {
  return (
    <EcommerceBuyerLayout>
      <ProductDetailPage />
    </EcommerceBuyerLayout>
  );
}

