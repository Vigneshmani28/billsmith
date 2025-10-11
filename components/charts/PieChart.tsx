"use client";

import React, { useMemo } from "react";
import { VictoryPie, VictoryTooltip } from "victory";

type StatusData = {
  name: string;
  value: number;
  color: string;
}[];

interface PieChartProps {
  data: StatusData;
}

const MemoizedPieChart: React.FC<PieChartProps> = React.memo(({ data }) => {
  const chartData = useMemo(
    () =>
      data.map(d => ({
        x: d.name,
        y: d.value,
        label: `${d.name}: ${d.value}`,
        fill: d.color,
      })),
    [data]
  );

  if (data.length === 0)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No invoice data available
      </div>
    );

  return (
    <div className="flex justify-center items-center h-full">
      <VictoryPie
        data={chartData}
        innerRadius={60}
        labels={({ datum }) => datum.label}
        labelComponent={<VictoryTooltip />}
        colorScale={data.map(d => d.color)}
        animate={{ duration: 300 }}
        style={{
          labels: { fontSize: 12, fill: "#333" },
        }}
      />
    </div>
  );
});

export default MemoizedPieChart;
