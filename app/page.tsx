"use client";

import { ContentLoader } from "@/components/loader";
import { StatusWidgets } from "@/components/StatusWidgets";
import { fetchUserInvoices } from "@/lib/supabase/fetchInvoices";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  AlertCircle,
  DollarSign,
  FileText,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import MemoizedPieChart from "@/components/charts/PieChart";
import MemoizedBarChart from "@/components/charts/BarChart";
import MemoizedLineChart from "@/components/charts/LineChart";
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  user_id: string;
  invoice_number: string;
  date: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  to_address: string;
  status: string;
  items: InvoiceItem[];
  tax_rate: number;
  discount: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

const COLORS = {
  paid: "#10B981",
  unpaid: "#EF4444",
  partial: "#F59E0B",
  overdue: "#8B5CF6",
};

const Dashboard = () => {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const loadInvoices = async () => {
      try {
        const data = await fetchUserInvoices(userId);
        setInvoices(data);
      } catch (error) {
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [userId, isLoaded, router]);

  // Process data for visualizations
  const statusCounts = invoices.reduce(
    (acc, invoice) => {
      const status = invoice.status.toLowerCase();
      if (status === "paid") acc.paid += 1;
      else if (status === "unpaid") acc.unpaid += 1;
      else if (status === "partial") acc.partial += 1;
      else if (status === "overdue") acc.overdue += 1;
      return acc;
    },
    { paid: 0, unpaid: 0, partial: 0, overdue: 0 }
  );

  const statusData = [
    { name: "Paid", value: statusCounts.paid, color: COLORS.paid },
    { name: "Unpaid", value: statusCounts.unpaid, color: COLORS.unpaid },
    { name: "Partial", value: statusCounts.partial, color: COLORS.partial },
    { name: "Overdue", value: statusCounts.overdue, color: COLORS.overdue },
  ].filter((item) => item.value > 0); // Only show statuses with data

  // Calculate financial metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const partialPaidAmount = invoices
    .filter((inv) => inv.status.toLowerCase() === "partial")
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstandingAmount = invoices
    .filter((inv) =>
      ["unpaid", "overdue", "partial"].includes(inv.status.toLowerCase())
    )
    .reduce((sum, inv) => sum + inv.total, 0);

  // Monthly data for bar chart
  const validStatuses = ["paid", "unpaid", "partial", "overdue"] as const;
  type StatusKey = (typeof validStatuses)[number];

  const monthlyData = invoices.reduce((acc, invoice) => {
    const month = format(new Date(invoice.date), "MMM yyyy");
    const status = invoice.status.toLowerCase();

    if (!acc[month]) {
      acc[month] = {
        month,
        paid: 0,
        unpaid: 0,
        partial: 0,
        overdue: 0,
        revenue: 0,
      };
    }

    // Only increment if status is a valid key
    if (validStatuses.includes(status as StatusKey)) {
      acc[month][status as StatusKey] += 1;
    }

    if (status === "paid") {
      acc[month].revenue += invoice.total;
    }

    return acc;
  }, {} as Record<string, { month: string; paid: number; unpaid: number; partial: number; overdue: number; revenue: number }>);

  const monthlyChartData = Object.values(monthlyData).sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Recent invoices for quick view
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "paid";
      case "partial":
        return "partial";
      case "overdue":
        return "overdue";
      default:
        return "unpaid";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {getGreeting()},{" "}
          <span className="font-bold">{user?.firstName || "User"}</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's your invoice dashboard overview
        </p>
      </div>

      {loading ? (
        <ContentLoader />
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatsCard
              title="Total Invoices"
              value={invoices.length}
              subtitle="All time invoices"
              icon={<FileText className="h-5 w-5" />}
            />

            <StatsCard
              title="Total Revenue"
              value={
                "₹" +
                totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
              subtitle="From paid invoices"
              icon={<IndianRupee className="h-5 w-5" />}
            />

            <StatsCard
              title="Total Partial Revenue"
              value={
                "₹" +
                partialPaidAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
              subtitle="From partial invoices"
              icon={<IndianRupee className="h-5 w-5" />}
            />

            <StatsCard
              title="Outstanding"
              value={
                "₹" +
                outstandingAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
              subtitle="Unpaid/overdue invoices"
              icon={<AlertCircle className="h-5 w-5" />}
            />

            <StatsCard
              title="Paid Rate"
              value={
                invoices.length > 0
                  ? `${Math.round(
                      (statusCounts.paid / invoices.length) * 100
                    )}%`
                  : "0%"
              }
              subtitle="Percentage of paid invoices"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <MemoizedPieChart data={statusData} />
              </CardContent>
            </Card>

            {/* Monthly Status Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Invoice Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <MemoizedBarChart data={monthlyChartData} />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Paid Invoices)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <MemoizedLineChart data={monthlyChartData} />
            </CardContent>
          </Card>
          {/* Recent Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          #{invoice.invoice_number} - {invoice.to_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(invoice.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            ₹{invoice.total.toFixed(2)}
                          </div>
                        </div>
                        <Badge
                          variant={getVariant(invoice.status)}
                          className="text-xs capitalize mt-1"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-32 items-center justify-center text-gray-500">
                    No recent invoices
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
