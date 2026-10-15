import SellerProperties from "@/RealEstate/pages/seller/Properties";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SellerPropertiesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("zayanToken")?.value;

  if (!token) {
    redirect("/login");
  }

  // RTK Query will handle data fetching on client side with caching
  // Server-side redirect is handled here for authentication
  return <SellerProperties />;
}

