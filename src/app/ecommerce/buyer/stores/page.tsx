import Sellers from "@/components/pages/buyer/Sellers";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function SellersPage() {
  return (
    <EcommerceBuyerLayout>
      <Sellers />
    </EcommerceBuyerLayout>
  );
}

