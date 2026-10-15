import EditProfile from "@/components/pages/buyer/EditProfile";
import { EcommerceBuyerLayout } from "@/components/EcommerceBuyerLayout";

export const dynamic = 'force-dynamic';

export default function EditProfilePage() {
  return (
    <EcommerceBuyerLayout>
      <EditProfile />
    </EcommerceBuyerLayout>
  );
}

