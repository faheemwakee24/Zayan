import ProductsList from "@/components/pages/seller/products/ProductsList";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function ProductsListPage() {
  return (
    <SellerLayout>
      <ProductsList />
    </SellerLayout>
  );
}

