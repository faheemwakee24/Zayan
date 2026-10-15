"use client";

import { AnalyticsDashboard } from "@/components/analytics";
import { DashboardLayout } from "@/RealEstate/components/DashboardLayout";
import { useGetPropertiesQuery } from "@/services/redux/api/propertyApi";

export const dynamic = "force-dynamic";

export default function RealEstateAnalyticsPage() {
  // Fetch properties for filtering
  const { data: propertiesData } = useGetPropertiesQuery();
  const properties = propertiesData?.properties || [];

  // Format properties for filter dropdown
  const propertyItems = properties.map((property) => ({
    _id: property._id,
    name: property.title,
    title: property.title, // For consistency with AnalyticsDashboard
  }));

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your property performance with detailed metrics and insights
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard itemType="property" items={propertyItems} />
      </div>
    </DashboardLayout>
  );
}

