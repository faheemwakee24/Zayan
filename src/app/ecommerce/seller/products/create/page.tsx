import CreateProduct from "@/components/pages/seller/products/CreateProduct";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function CreateProductPage() {
  return (
    <SellerLayout>
      <CreateProduct />
    </SellerLayout>
  );
}

