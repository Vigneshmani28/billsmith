"use client";
import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyChartData ={
    month: string;
    paid: number;
    unpaid: number;
    partial: number;
    overdue: number;
    revenue: number;
}[]

const COLORS = {
  paid: "#10B981",
  unpaid: "#EF4444",
  partial: "#F59E0B",
  overdue: "#8B5CF6",
};

const MemoizedBarChart = React.memo(({ data }: { data: MonthlyChartData }) => {
  if (data.length === 0)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No monthly data available
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="paid" stackId="a" fill={COLORS.paid} name="Paid" />
        <Bar dataKey="partial" stackId="a" fill={COLORS.partial} name="Partial" />
        <Bar dataKey="unpaid" stackId="a" fill={COLORS.unpaid} name="Unpaid" />
        <Bar dataKey="overdue" stackId="a" fill={COLORS.overdue} name="Overdue" />
      </BarChart>
    </ResponsiveContainer>
  );
});

export default MemoizedBarChart;