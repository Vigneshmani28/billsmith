"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface StatsCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: ReactNode;
  color: string;
  loading?: boolean;
}

const StatsCard = ({ title, value, subtitle, icon, color, loading }: StatsCardProps) => {
  return (
    <div
  className={`flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-gray-900 shadow-lg transition-transform duration-200 transform hover:-translate-y-1 hover:shadow-xl`}
>
  {/* Icon */}
  <div
    className={`p-4 rounded-full flex items-center justify-center text-white ${color}`}
  >
    {icon}
  </div>

  {/* Text */}
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
      {title}
    </span>

    {/* Value or Skeleton */}
    <span className="text-2xl font-bold text-gray-900 dark:text-white">
      {loading ? <Skeleton className="h-6 w-16" /> : value}
    </span>

    <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">
      {subtitle}
    </span>
  </div>
</div>
  );
};



export default StatsCard;
