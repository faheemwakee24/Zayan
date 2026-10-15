import Index from "@/components/pages/IndexComponent";
import BuyerLayout from "@/components/BuyerLayout";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <BuyerLayout>
      <Index />
    </BuyerLayout>
  );
}
