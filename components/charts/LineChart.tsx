"use client";
import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyChartData = {
    month: string;
    paid: number;
    unpaid: number;
    partial: number;
    overdue: number;
    revenue: number;
}[]

const MemoizedLineChart = React.memo(({ data }: { data: MonthlyChartData }) => {
  const hasRevenueData = data.filter((m) => m.revenue > 0).length > 0;
  if (!hasRevenueData)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No revenue data available
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default MemoizedLineChart;