import ViewProfile from "@/components/pages/buyer/ViewProfile";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <EcommerceBuyerLayout>
      <ViewProfile />
    </EcommerceBuyerLayout>
  );
}

