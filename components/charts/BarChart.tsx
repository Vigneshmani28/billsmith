"use client";

import React, { useMemo } from "react";
import { VictoryChart, VictoryStack, VictoryBar, VictoryAxis, VictoryLegend, VictoryTooltip } from "victory";

type MonthlyChartData = {
  month: string;
  paid: number;
  unpaid: number;
  overdue: number;
  revenue: number;
}[];

interface BarChartProps {
  data: MonthlyChartData;
}

const COLORS = {
  paid: "#10B981",
  unpaid: "#EF4444",
  overdue: "#8B5CF6",
};

const MemoizedBarChart: React.FC<BarChartProps> = React.memo(({ data }) => {
  if (data.length === 0)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No monthly data available
      </div>
    );

  const chartData = useMemo(
    () =>
      ({
        paid: data.map(d => ({ x: d.month, y: d.paid, label: `Paid: ${d.paid}` })),
        unpaid: data.map(d => ({ x: d.month, y: d.unpaid, label: `Unpaid: ${d.unpaid}` })),
        overdue: data.map(d => ({ x: d.month, y: d.overdue, label: `Overdue: ${d.overdue}` })),
      }),
    [data]
  );

  return (
    <VictoryChart domainPadding={{ x: 30, y: 20 }}>
      <VictoryAxis
        tickValues={data.map(d => d.month)}
        style={{ tickLabels: { angle: -45, fontSize: 10, padding: 15 } }}
      />
      <VictoryAxis dependentAxis />
      <VictoryStack colorScale={[COLORS.paid,COLORS.unpaid, COLORS.overdue]}>
        <VictoryBar data={chartData.paid} labels={({ datum }) => datum.label} labelComponent={<VictoryTooltip />} />
        <VictoryBar data={chartData.unpaid} labels={({ datum }) => datum.label} labelComponent={<VictoryTooltip />} />
        <VictoryBar data={chartData.overdue} labels={({ datum }) => datum.label} labelComponent={<VictoryTooltip />} />
      </VictoryStack>
      <VictoryLegend
        x={50}
        y={10}
        orientation="horizontal"
        gutter={20}
        data={[
          { name: "Paid", symbol: { fill: COLORS.paid } },
          { name: "Unpaid", symbol: { fill: COLORS.unpaid } },
          { name: "Overdue", symbol: { fill: COLORS.overdue } },
        ]}
      />
    </VictoryChart>
  );
});

export default MemoizedBarChart;
