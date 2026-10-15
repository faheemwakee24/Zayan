import EditProduct from "@/components/pages/seller/products/EditProduct";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function EditProductPage() {
  return (
    <SellerLayout>
      <EditProduct />
    </SellerLayout>
  );
}

