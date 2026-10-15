"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
  Clock,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import {
  useGetAnalyticsOverviewQuery,
  useGetTimeSeriesDataQuery,
  useGetTopItemsQuery,
  useGetResponseTimeTrendsQuery,
  AnalyticsQueryParams,
} from "@/services/redux/api/analyticsApi";

interface AnalyticsDashboardProps {
  itemType?: "product" | "property";
  items?: Array<{ _id: string; name?: string; title?: string }>; // For filtering by specific items
}

export function AnalyticsDashboard({ itemType, items = [] }: AnalyticsDashboardProps) {
  const [filters, setFilters] = useState<AnalyticsQueryParams>({
    itemType: itemType,
    groupBy: "day",
    limit: 10,
  });

  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  // Build query params
  const queryParams = useMemo<AnalyticsQueryParams>(() => {
    return {
      ...filters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }, [filters, dateRange]);

  // Fetch analytics data
  const { data: overviewData, isLoading: isLoadingOverview } = useGetAnalyticsOverviewQuery(
    queryParams
  );
  const { data: timeSeriesData, isLoading: isLoadingTimeSeries } = useGetTimeSeriesDataQuery(
    queryParams
  );
  const { data: topItemsData, isLoading: isLoadingTopItems } = useGetTopItemsQuery(queryParams);
  const { data: responseTimeData, isLoading: isLoadingResponseTime } =
    useGetResponseTimeTrendsQuery(queryParams);

  const metrics = overviewData?.metrics || {
    views: 0,
    clicks: 0,
    chatsStarted: 0,
    messagesSent: 0,
    messagesReceived: 0,
    conversionRate: 0,
    avgResponseTimeMinutes: null,
  };

  const timeSeriesChartData = timeSeriesData?.data || [];
  const topItems = topItemsData?.items || [];
  const responseTimeTrends = responseTimeData?.data || [];

  const handleFilterChange = (key: keyof AnalyticsQueryParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleDateRangeChange = (type: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const metricCards = [
    {
      label: "Total Views",
      value: metrics.views.toLocaleString(),
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Clicks",
      value: metrics.clicks.toLocaleString(),
      icon: MousePointerClick,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Chats Started",
      value: metrics.chatsStarted.toLocaleString(),
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Avg Response Time",
      value:
        metrics.avgResponseTimeMinutes !== null
          ? `${metrics.avgResponseTimeMinutes} min`
          : "N/A",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-primary">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <Label htmlFor="startDate" className="mb-2 block">
              Start Date
            </Label>
            <input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="mb-2 block">
              End Date
            </Label>
            <input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Item Type Filter */}
          {!itemType && (
            <div>
              <Label htmlFor="itemType" className="mb-2 block">
                Item Type
              </Label>
              <Select
                value={filters.itemType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("itemType", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger id="itemType" className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="property">Properties</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Specific Item Filter */}
          {items.length > 0 && (
            <div>
              <Label htmlFor="itemId" className="mb-2 block">
                {itemType === "property" ? "Property" : "Product"}
              </Label>
              <Select
                value={filters.itemId || "all"}
                onValueChange={(value) =>
                  handleFilterChange("itemId", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger id="itemId" className="w-full">
                  <SelectValue placeholder="All Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {items.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name || item.title || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Group By Filter */}
          <div>
            <Label htmlFor="groupBy" className="mb-2 block">
              Group By
            </Label>
            <Select
              value={filters.groupBy || "day"}
              onValueChange={(value) => handleFilterChange("groupBy", value)}
            >
              <SelectTrigger id="groupBy" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Activity Over Time</h3>
          {isLoadingTimeSeries ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : timeSeriesChartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="chatsStarted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Chats Started"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Response Time Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Response Time Trends</h3>
          {isLoadingResponseTime ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : responseTimeTrends.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No response time data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Minutes", angle: -90 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgResponseTimeMinutes"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Avg Response Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Top Performing Items */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Top Performing Items</h3>
        {isLoadingTopItems ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : topItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items data available
          </div>
        ) : (
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div
                key={item.itemId}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.itemType === "property" ? "Property" : "Product"}
                    {item.price && ` • ${item.itemType === "property" ? "$" : ""}${item.price.toLocaleString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{item.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {filters.metric || "views"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Messages Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Messages Activity</h3>
        {isLoadingTimeSeries ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : timeSeriesChartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No message data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeSeriesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="messagesSent" fill="#3b82f6" name="Messages Sent" />
              <Bar dataKey="messagesReceived" fill="#10b981" name="Messages Received" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

