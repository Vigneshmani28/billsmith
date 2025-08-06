"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock, XCircle, GalleryHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const statusInfo = {
  total: {
    label: "Total",
    icon: GalleryHorizontal,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  unpaid: {
    label: "Unpaid",
    icon: XCircle,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
  partial: {
    label: "Partial",
    icon: Clock,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-red-500 bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
};

type StatusCounts = {
  paid: number;
  unpaid: number;
  partial: number;
  overdue: number;
};

type Props = {
  stats: StatusCounts & { total: number };
  className?: string;
};

export function StatusWidgets({ stats, className }: Props) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-5 gap-3", className)}>
      {(Object.keys(statusInfo) as Array<keyof typeof statusInfo>).map((status) => {
        const Icon = statusInfo[status].icon;
        return (
          <Card
            key={status}
            className={cn(
              "border rounded-lg shadow-sm hover:shadow transition-shadow",
              statusInfo[status].borderColor
            )}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md flex items-center justify-center",
                    statusInfo[status].color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{stats[status]}</p>
                  <p className="text-xs text-muted-foreground">Invoices</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium">
                {statusInfo[status].label}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}