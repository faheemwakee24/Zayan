import StoreDetailPage from "@/components/pages/buyer/StoreDetailPage";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function StoreDetailPageRoute() {
  return (
    <EcommerceBuyerLayout>
      <StoreDetailPage />
    </EcommerceBuyerLayout>
  );
}

