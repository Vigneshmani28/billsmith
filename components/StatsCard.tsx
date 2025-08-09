"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StatsCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: ReactNode;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 shadow-md rounded-lg w-full max-w-full max-w-xs">
      <CardHeader className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-700 pb-2 px-3 sm:px-4">
        <CardTitle className="text-[10px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 shadow-sm shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4">
        <div className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100 leading-tight break-words whitespace-normal">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-[9px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-300 tracking-wide break-words whitespace-normal">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

