"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Package, Eye, Download } from "lucide-react";

const orders = [
  {
    id: "ORD-001",
    buyerName: "Hassan Ahmed",
    product: "Wireless Headphones",
    quantity: 1,
    amount: 299,
    status: "Shipped",
    date: "2 hours ago",
    paymentStatus: "Completed",
  },
  {
    id: "ORD-002",
    buyerName: "Ayesha Khan",
    product: "Phone Case (x50)",
    quantity: 50,
    amount: 750,
    status: "Processing",
    date: "4 hours ago",
    paymentStatus: "Completed",
  },
  {
    id: "ORD-003",
    buyerName: "Ali Raza",
    product: "USB-C Cable",
    quantity: 5,
    amount: 75,
    status: "Delivered",
    date: "1 day ago",
    paymentStatus: "Completed",
  },
  {
    id: "ORD-004",
    buyerName: "Fatima Khan",
    product: "Portable Charger",
    quantity: 2,
    amount: 90,
    status: "Pending",
    date: "2 days ago",
    paymentStatus: "Pending",
  },
  {
    id: "ORD-005",
    buyerName: "Ahmed Ali",
    product: "Wireless Headphones",
    quantity: 3,
    amount: 897,
    status: "Delivered",
    date: "3 days ago",
    paymentStatus: "Completed",
  },
];

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders
    .filter(
      (o) =>
        o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((o) => statusFilter === "all" || o.status === statusFilter);

  const statuses = ["all", ...new Set(orders.map((o) => o.status))];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Delivered: "bg-green-100 text-green-700",
      Shipped: "bg-blue-100 text-blue-700",
      Processing: "bg-yellow-100 text-yellow-700",
      Pending: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Orders
            </h1>
            <p className="text-muted-foreground mt-1">Manage all your orders</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Orders
          </Button>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-primary">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-accent">
              {orders.filter((o) => o.status === "Pending").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Processing</p>
            <p className="text-3xl font-bold text-secondary">
              {orders.filter((o) => o.status === "Processing").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Delivered</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter((o) => o.status === "Delivered").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders, buyer, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative min-w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white pr-10"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-foreground">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ${order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.paymentStatus === "Completed" ? (
                          <span className="text-green-600 font-medium">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.date}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
