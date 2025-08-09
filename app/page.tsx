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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"];

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
    { name: "Paid", value: statusCounts.paid },
    { name: "Unpaid", value: statusCounts.unpaid },
    { name: "Partial", value: statusCounts.partial },
    { name: "Overdue", value: statusCounts.overdue },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const barDataMap: Record<
    string,
    {
      month: string;
      paid: number;
      unpaid: number;
      partial: number;
      overdue: number;
    }
  > = {};

  invoices.forEach((inv) => {
    const month = new Date(inv.date).toLocaleString("default", {
      month: "short",
    });
    if (!barDataMap[month]) {
      barDataMap[month] = { month, paid: 0, unpaid: 0, partial: 0, overdue: 0 };
    }
    const status = inv.status.toLowerCase();
    if (status === "paid") barDataMap[month].paid += 1;
    else if (status === "unpaid") barDataMap[month].unpaid += 1;
    else if (status === "partial") barDataMap[month].partial += 1;
    else if (status === "overdue") barDataMap[month].overdue += 1;
  });

  const groupedBarData = Object.values(barDataMap);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {getGreeting()},{" "}
          <span className="font-bold">{user?.firstName || "User"}</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here’s an overview of your invoices.
        </p>
      </div>

      {loading ? (
        <ContentLoader />
      ) : (
        <>
          <StatusWidgets
            stats={{ ...statusCounts, total: invoices.length }}
            className="mt-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Invoices by Month</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupedBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="paid" fill="#10B981" name="Paid" />
                    <Bar dataKey="unpaid" fill="#F59E0B" name="Unpaid" />
                    <Bar dataKey="partial" fill="#3B82F6" name="Partial" />
                    <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
