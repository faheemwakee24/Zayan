import CategoriesList from "@/components/pages/seller/categories/CategoriesList";
import SellerLayout from "@/components/SellerLayout";

export const dynamic = 'force-dynamic';


export default function CategoriesListPage() {
  return (
    <SellerLayout>
      <CategoriesList />
    </SellerLayout>
  );
}

