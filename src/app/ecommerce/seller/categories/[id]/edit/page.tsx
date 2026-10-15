import CreateCategory from "@/components/pages/seller/categories/CreateCategory";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';

export default function EditCategoryPage() {
  return (
    <SellerLayout>
      <CreateCategory />
    </SellerLayout>
  );
}

