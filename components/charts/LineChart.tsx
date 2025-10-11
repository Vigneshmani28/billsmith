"use client";
import React from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLegend,
  VictoryGroup
} from "victory";

type MonthlyChartData = {
    month: string;
    paid: number;
    unpaid: number;
    overdue: number;
    revenue: number;
}[];

const MemoizedLineChart = React.memo(({ data }: { data: MonthlyChartData }) => {
  const hasRevenueData = data.filter((m) => m.revenue > 0).length > 0;
  if (!hasRevenueData)
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No revenue data available
      </div>
    );

  // Format data for Victory (Victory expects x/y keys)
  const revenueData = data.map((d) => ({
    x: d.month,
    y: d.revenue,
    label: `₹${d.revenue.toLocaleString()}`
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 30, y: 20 }}
        padding={{ top: 40, bottom: 60, left: 60, right: 30 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => datum.label}
            labelComponent={
              <VictoryTooltip
                style={{ fontSize: 14 }}
                flyoutPadding={10}
                cornerRadius={6}
                flyoutStyle={{ fill: "white" }}
              />
            }
          />
        }
      >
        <VictoryAxis
          tickFormat={(m) => m}
          style={{
            tickLabels: { angle: -45, textAnchor: "end", fontSize: 12, padding: 10 }
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 12, padding: 5 }
          }}
        />
        <VictoryLegend
          x={100}
          y={10}
          orientation="horizontal"
          gutter={20}
          data={[{ name: "Revenue", symbol: { fill: "#3B82F6" } }]}
        />
        <VictoryGroup>
          <VictoryLine
            data={revenueData}
            interpolation="monotoneX"
            style={{
              data: { stroke: "#3B82F6", strokeWidth: 2 }
            }}
            animate={{ duration: 700 }}
          />
        </VictoryGroup>
      </VictoryChart>
    </div>
  );
});

export default MemoizedLineChart;