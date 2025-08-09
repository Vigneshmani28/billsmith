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
    <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 shadow-md rounded-lg">
      <CardHeader className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-700 pb-3">
        <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 leading-tight">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 tracking-wide">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
