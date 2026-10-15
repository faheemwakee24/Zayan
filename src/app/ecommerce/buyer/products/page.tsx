import Products from "@/components/pages/BuyerProducts";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return (
    <EcommerceBuyerLayout>
      <Products />
    </EcommerceBuyerLayout>
  );
}

