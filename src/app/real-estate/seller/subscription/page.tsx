import SubscriptionManagement from "@/components/pages/seller/SubscriptionManagement";
import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";

export const dynamic = "force-dynamic";

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <SubscriptionManagement role="realEstateSeller" />
    </DashboardLayout>
  );
}

