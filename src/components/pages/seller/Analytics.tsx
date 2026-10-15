"use client";

import { AnalyticsDashboard } from "@/components/analytics";
import { useGetProductsQuery } from "@/services/redux/api/productApi";

export default function Analytics() {
  // Fetch products for filtering
  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.products || [];

  // Format products for filter dropdown
  const productItems = products.map((product) => ({
    _id: product._id,
    name: product.name,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your store performance with detailed metrics and insights
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard itemType="product" items={productItems} />
      </div>
    </div>
  );
}
