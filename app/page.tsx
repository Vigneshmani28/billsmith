"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  DollarSign,
  FileText,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import MemoizedPieChart from "@/components/charts/PieChart";
import MemoizedBarChart from "@/components/charts/BarChart";
import MemoizedLineChart from "@/components/charts/LineChart";
import { useAuth } from "@/context/auth-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchInvoices } from "@/store/slices/invoice/invoiceSlice";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StatsCard from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Currency } from "@/components/Currency";

const COLORS = {
  paid: "#10B981",
  unpaid: "#EF4444",
  overdue: "#8B5CF6",
};

const Dashboard = () => {
  const { user, token, loading } = useRequireAuth();

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: invoices,
    loading: invoiceLoading,
    error,
  } = useSelector((state: RootState) => state.invoices);

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    dispatch(fetchInvoices())
      .unwrap()
      .catch(() => toast.error("Failed to load invoices"));
  }, [user, token, loading, dispatch, router]);

  // Process data for visualizations
  const statusCounts = invoices.reduce(
    (acc, invoice) => {
      const status = invoice.status.toLowerCase();
      if (status === "paid") acc.paid += 1;
      else if (status === "unpaid") acc.unpaid += 1;
      else if (status === "overdue") acc.overdue += 1;
      return acc;
    },
    { paid: 0, unpaid: 0, overdue: 0 }
  );

  const statusData = [
    { name: "Paid", value: statusCounts.paid, color: COLORS.paid },
    { name: "Unpaid", value: statusCounts.unpaid, color: COLORS.unpaid },
    { name: "Overdue", value: statusCounts.overdue, color: COLORS.overdue },
  ].filter((item) => item.value > 0); // Only show statuses with data

  const stableStatusData = useMemo(() => statusData, [statusData]);

  // Calculate financial metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstandingAmount = invoices
    .filter((inv) => ["unpaid", "overdue"].includes(inv.status.toLowerCase()))
    .reduce((sum, inv) => sum + inv.total, 0);

  // Monthly data for bar chart
  const validStatuses = ["paid", "unpaid", "overdue"] as const;
  type StatusKey = (typeof validStatuses)[number];

  const monthlyData = invoices.reduce((acc, invoice) => {
    const month = format(new Date(invoice.date), "MMM yyyy");
    const status = invoice.status.toLowerCase();

    if (!acc[month]) {
      acc[month] = {
        month,
        paid: 0,
        unpaid: 0,
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
  }, {} as Record<string, { month: string; paid: number; unpaid: number; overdue: number; revenue: number }>);

  const monthlyChartData = Object.values(monthlyData).sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  const stableMonthlyData = useMemo(() => monthlyChartData, [monthlyChartData]);

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

  function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-700 bg-green-100";
      case "unpaid":
        return "text-yellow-700 bg-yellow-100";
      case "overdue":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  }

  if (!user || !token) return null;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {getGreeting()},{" "}
          <span className="font-bold">
            {user?.name.split(" ")[0] || user?.username || "User"}
          </span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's your invoice dashboard overview
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-2 sm:px-4">
        <StatsCard
          title="Total Invoices"
          value={invoices.length}
          subtitle="All time invoices"
          icon={<FileText className="h-6 w-6 text-indigo-700" />}
          color="bg-indigo-200 dark:bg-indigo-700/20"
          loading={invoiceLoading}
        />

        <StatsCard
          title="Total Revenue"
          value={<Currency amount={totalRevenue} />}
          subtitle="From paid invoices"
          icon={<IndianRupee className="h-6 w-6 text-green-700" />}
          color="bg-green-200 dark:bg-green-700/20"
          loading={invoiceLoading}
        />

        <StatsCard
          title="Outstanding"
          value={<Currency amount={outstandingAmount} />}
          subtitle="Unpaid / overdue invoices"
          icon={<AlertCircle className="h-6 w-6 text-red-700" />}
          color="bg-red-200 dark:bg-red-700/20"
          loading={invoiceLoading}
        />

        <StatsCard
          title="Paid Rate"
          value={
            invoices.length > 0
              ? `${Math.round((statusCounts.paid / invoices.length) * 100)}%`
              : "0%"
          }
          subtitle="Percentage of paid invoices"
          icon={<TrendingUp className="h-6 w-6 text-yellow-700" />}
          color="bg-yellow-200 dark:bg-yellow-700/20"
          loading={invoiceLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Left side: title + subtitle */}
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Pending Invoices
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track unpaid, overdue paid invoices
              </p>
            </div>

            {/* Right side: button */}
            <Link href="/invoices">
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {invoiceLoading ? (
            // Loading skeleton
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            // No invoices at all
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                No invoices yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Create your first invoice to get started with managing your
                billing
              </p>
              <Button className="mt-4" onClick={() => router.push("/new")}>
                Create Invoice
              </Button>
            </div>
          ) : invoices.filter((inv) =>
              ["unpaid", "overdue"].includes(inv.status.toLowerCase())
            ).length === 0 ? (
            // All invoices are paid
            <div className="flex flex-col items-center justify-center h-32 rounded-xl p-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-lg font-semibold text-green-800 dark:text-green-200">
                All invoices are paid
              </span>
              <span className="text-sm text-green-700 dark:text-green-300 mt-1">
                You have no pending invoices
              </span>
            </div>
          ) : (
            // Show pending invoices
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {invoices
                .filter((inv) =>
                  ["unpaid", "overdue"].includes(inv.status.toLowerCase())
                )
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 5)
                .map((invoice) => (
                  <Link
                    href={`/invoice/${invoice.id}/edit`}
                    key={invoice.id}
                    className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    {/* Left: User + Invoice Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {invoice.to_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {invoice.to_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          #{invoice.invoice_number} •{" "}
                          {format(new Date(invoice.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-right min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          <Currency amount={invoice.total} />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {invoice.to_email}
                        </div>
                      </div>
                      <Badge
                        className={`capitalize text-xs px-2 py-0.5 font-medium mt-1 sm:mt-0 ${getStatusClasses(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {invoiceLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MemoizedPieChart data={stableStatusData} />
            )}
          </CardContent>
        </Card>

        {/* Monthly Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Invoice Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {invoiceLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MemoizedBarChart data={stableMonthlyData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Recent Invoices
            </CardTitle>
            <Link href="/invoices">
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {recentInvoices.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentInvoices.map((invoice) => (
                <Link href={`/invoice/${invoice.id}/edit`} key={invoice.id}>
                  <div
                    key={invoice.id}
                    className="group cursor-pointer flex items-center p-4 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          #{invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(invoice.date), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 truncate">
                        {invoice.to_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">
                          <Currency amount={invoice.total} />
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Badge
                          className={`capitalize text-xs px-2 py-0.5 font-medium ${getStatusClasses(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </Badge>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 dark:text-gray-500">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                No invoices yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Create your first invoice to get started with managing your
                billing
              </p>
              <Button className="mt-4" onClick={() => router.push("/new")}>
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
