import BuyerLayout from "@/components/BuyerLayout";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center">
    <div className="text-center px-4">
      <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        This page is coming soon! Continue prompting to fill in this page
        content if you'd like.
      </p>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto"></div>
    </div>
  </div>
);

export default function CartPage() {
  return (
    <BuyerLayout>
      <PlaceholderPage title="Shopping Cart" />
    </BuyerLayout>
  );
}

