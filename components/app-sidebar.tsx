"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Atom,
  Construction,
  FileText,
  LayoutDashboard,
  LogOut,
  ReceiptText,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Invoices",
      href: "/invoices",
      icon: FileText,
    },
  ];

  return (
    <Sidebar className="transition-all duration-300" collapsible="icon">
      {/* HEADER */}
      <SidebarHeader>
        <div className="p-4 font-bold text-lg tracking-tight flex items-center gap-2 group-data-[state=collapsed]:justify-center justify-start">
          {/* Icon always visible */}
          <span className="text-primary text-xl">
            <ReceiptText />
          </span>

          {/* Text hidden in collapsed mode */}
          <span className="group-data-[state=collapsed]:hidden">Billsmith</span>
        </div>
      </SidebarHeader>

      {/* MAIN MENU */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav className="flex flex-col space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-2 py-2 h-10 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-start w-6 h-6 shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>

                    <span className="ml-3 whitespace-nowrap overflow-hidden group-data-[state=collapsed]:hidden">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}

      <SidebarFooter className="relative">
        {/* Modern Beta Badge */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-all duration-300">
          <span
            className={`
        hidden-sidebar px-3 py-1 rounded-full text-xs font-medium 
        bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-sm
        whitespace-nowrap transition-all duration-300
        flex items-center gap-1 group-data-[state=collapsed]:hidden
      `}
          >
            <Construction className="w-3.5 h-3.5" />
            Under Development (Beta)
          </span>
          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
