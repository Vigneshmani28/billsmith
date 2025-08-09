"use client";

import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type StatusData = {
    name: string;
    value: number;
    color: string;
}[]

const MemoizedPieChart = React.memo(({ data }: { data: StatusData }) => {
  if (data.length === 0)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No invoice data available
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} invoices`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

export default MemoizedPieChart;