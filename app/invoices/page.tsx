"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  MoreVertical,
  Download,
  Search,
  X,
  Mail,
  Loader2,
  Check,
  Share2,
  CalendarDays,
  User2,
  Copy,
  Grid3X3,
  List,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { generatePDF } from "@/utils/pdf-generator";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/CustomDateFilter";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoices } from "@/store/slices/invoice/invoiceSlice";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { deleteInvoice } from "@/store/slices/invoice/deleteInvoice";
import { fetchInvoiceById } from "@/store/slices/invoice/invoiceByIdSlice";
import { Currency } from "@/components/Currency";

export default function HomePage() {
  const { user, token, loading } = useRequireAuth();
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null); // invoice id
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [customMinAmount, setCustomMinAmount] = useState<number | undefined>(undefined);
  const [customMaxAmount, setCustomMaxAmount] = useState<number | undefined>(undefined);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    undefined
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    undefined
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 0);

  const dispatch = useDispatch<AppDispatch>();

  const {
    items: invoices,
    loading: invoiceLoading,
    error,
  } = useSelector((state: RootState) => state.invoices);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("invoiceViewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode as "grid" | "list");
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    dispatch(fetchInvoices())
      .unwrap()
      .catch(() => toast.error("Failed to load invoices"));
  }, [user, token, loading, dispatch, router]);

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      setDeletingId(invoiceToDelete);
      await dispatch(deleteInvoice(invoiceToDelete)).unwrap();
      dispatch(fetchInvoices());
      toast.success("Invoice deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice");
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    // 1️⃣ Search filter
    const matchesSearch =
      !debouncedSearchTerm ||
      inv.invoice_number
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      inv.to_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    // 2️⃣ Status filter
    const matchesStatus =
      !statusFilter || inv.status?.toLowerCase() === statusFilter.toLowerCase();

    // 3️⃣ State filter (Inter/Intra)
    const matchesState = (() => {
      if (!stateFilter) return true;
      if (stateFilter === "inter") return inv.is_inter_state === true;
      if (stateFilter === "intra") return inv.is_inter_state === false;
      return true;
    })();

    // 4️⃣ Amount filter
    const matchesAmount = (() => {
      if (!amountFilter) return true;
      const invoiceTotal = inv.total || 0;

      if (amountFilter === "under_10k") return invoiceTotal < 10000;
      if (amountFilter === "10k_50k") return invoiceTotal >= 10000 && invoiceTotal <= 50000;
      if (amountFilter === "50k_100k") return invoiceTotal >= 50000 && invoiceTotal <= 100000;
      if (amountFilter === "above_100k") return invoiceTotal > 100000;
      
      if (amountFilter === "custom") {
        if (customMinAmount !== undefined && customMaxAmount !== undefined) {
          return invoiceTotal >= customMinAmount && invoiceTotal <= customMaxAmount;
        }
        if (customMinAmount !== undefined) {
          return invoiceTotal >= customMinAmount;
        }
        if (customMaxAmount !== undefined) {
          return invoiceTotal <= customMaxAmount;
        }
      }
      
      return true;
    })();

    // 5️⃣ Date filter
    const matchesDate = (() => {
      if (!dateFilter) return true;

      // Convert to local date (ignore time zone shifts)
      const invoiceDate = new Date(inv.date);
      const invLocal = new Date(
        invoiceDate.getFullYear(),
        invoiceDate.getMonth(),
        invoiceDate.getDate()
      );

      if (dateFilter === "today") {
        const today = new Date();
        const todayLocal = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        return invLocal.getTime() === todayLocal.getTime();
      }

      if (dateFilter === "this_week") {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sun
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return invLocal >= startOfWeek && invLocal <= endOfWeek;
      }

      if (dateFilter === "this_month") {
        const today = new Date();
        return (
          invoiceDate.getMonth() === today.getMonth() &&
          invoiceDate.getFullYear() === today.getFullYear()
        );
      }

      if (dateFilter === "this_year") {
        const today = new Date();
        return invoiceDate.getFullYear() === today.getFullYear();
      }

      if (dateFilter === "custom") {
        if (customStartDate && customEndDate) {
          // Normalize custom dates as well
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);

          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);

          return invLocal >= start && invLocal <= end;
        }
      }

      return true;
    })();

    return matchesSearch && matchesStatus && matchesState && matchesAmount && matchesDate;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("");
    setStateFilter("");
    setAmountFilter("");
    setCustomMinAmount(undefined);
    setCustomMaxAmount(undefined);
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

  // Count active filters
  const activeFiltersCount = [
    dateFilter,
    statusFilter, 
    stateFilter,
    amountFilter,
    customMinAmount,
    customMaxAmount,
    customStartDate,
    customEndDate
  ].filter(Boolean).length;

  const hasActiveFilters = searchTerm || activeFiltersCount > 0;

  function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-700 bg-green-100";
      case "unpaid":
        return "text-yellow-700 bg-yellow-100";
      case "overdue":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  }

  const handleCopy = async (invoiceNumber: string, invoiceId: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(invoiceNumber);
    } else {
      // Fallback for mobile / insecure contexts
      const textarea = document.createElement("textarea");
      textarea.value = invoiceNumber;
      textarea.style.position = "fixed"; // prevent scrolling to bottom
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedId(invoiceId);
    toast.success("Invoice number copied to clipboard");

    setTimeout(() => setCopiedId(null), 1500);
  } catch (err) {
    toast.error("Failed to copy invoice number", {
      description: (err as Error).message,
    });
  }
};


  const handleSendMail = async (invoiceid: string) => {
    try {
      const invoiceResponse = await dispatch(
        fetchInvoiceById(invoiceid)
      ).unwrap();

      await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: invoiceResponse }),
      });
      toast.success("Invoice email sent successfully!");
    } catch (error) {
      toast.error("Failed to send invoice email");
      console.error("Failed to send email:", error);
    }
  };

  const handleDownloadPDF = async (invoiceid: string) => {
    const invoiceResponse = await dispatch(fetchInvoiceById(invoiceid)).unwrap();
    generatePDF(invoiceResponse);
  };

  async function handleShareInvoice(invoice_publicid: string) {
    try {
      if (navigator.clipboard) {
        const publicUrl = `${window.location.origin}/public/invoice/${invoice_publicid}`;
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Invoice link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to make invoice public");
    }
  }

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("invoiceViewMode", mode);
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className=" mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Create and manage your invoices
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View, edit, and manage all your saved invoices.
          </p>
        </div>
        <Link href="/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-6 sticky top-18 bg-white z-10 p-2">
        {/* Top row: Search and main controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left side: Search */}
          <div className="w-full sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Search by client or invoice number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-20"
            />
            <Badge
              variant="outline"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none"
            >
              /
            </Badge>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right side: View Toggle and Filter Button */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel - Collapsible */}
        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* State Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">State Type</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter State</SelectItem>
                    <SelectItem value="intra">Intra State</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Amount Range</label>
                <Select value={amountFilter} onValueChange={setAmountFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All amounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_10k">Under ₹10K</SelectItem>
                    <SelectItem value="10k_50k">₹10K - ₹50K</SelectItem>
                    <SelectItem value="50k_100k">₹50K - ₹1L</SelectItem>
                    <SelectItem value="above_100k">Above ₹1L</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Amount Range */}
            {amountFilter === "custom" && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Custom Amount Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min amount"
                    value={customMinAmount || ""}
                    onChange={(e) => setCustomMinAmount(e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="number"
                    placeholder="Max amount"
                    value={customMaxAmount || ""}
                    onChange={(e) => setCustomMaxAmount(e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Custom Date Range */}
            {dateFilter === "custom" && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Custom Date Range</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <DatePicker
                      selectedDate={customStartDate}
                      onSelect={(date) => setCustomStartDate(date ?? undefined)}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">to</span>
                  <div className="flex-1">
                    <DatePicker
                      selectedDate={customEndDate}
                      onSelect={(date) => setCustomEndDate(date ?? undefined)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={resetFilters} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchTerm}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setSearchTerm("")}
                />
              </Badge>
            )}
            {stateFilter && (
              <Badge variant="secondary" className="gap-1">
                {stateFilter === "inter" ? "Inter State" : "Intra State"}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setStateFilter("")}
                />
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="secondary" className="gap-1 capitalize">
                {statusFilter}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => setStatusFilter("")}
                />
              </Badge>
            )}
            {amountFilter && (
              <Badge variant="secondary" className="gap-1">
                {amountFilter === "custom" 
                  ? `₹${customMinAmount || 0} - ₹${customMaxAmount || "∞"}`
                  : amountFilter === "under_10k" ? "Under ₹10K"
                  : amountFilter === "10k_50k" ? "₹10K - ₹50K"
                  : amountFilter === "50k_100k" ? "₹50K - ₹1L"
                  : "Above ₹1L"
                }
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => {
                    setAmountFilter("");
                    setCustomMinAmount(undefined);
                    setCustomMaxAmount(undefined);
                  }}
                />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="gap-1">
                {dateFilter === "custom" 
                  ? `${customStartDate?.toLocaleDateString()} - ${customEndDate?.toLocaleDateString()}`
                  : dateFilter === "today" ? "Today"
                  : dateFilter === "this_week" ? "This Week"
                  : dateFilter === "this_month" ? "This Month"
                  : "This Year"
                }
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => {
                    setDateFilter("");
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {invoiceLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12 sm:mt-20 gap-4">
          <div className="text-center text-muted-foreground text-base sm:text-lg">
            No invoices found.
          </div>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" : "space-y-4"}>
          {filteredInvoices.map((inv) => 
            viewMode === "grid" ? (
              <div
                key={inv.id}
                className="relative rounded-xl border bg-background shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header with Invoice No. and Status */}
                <div className="flex justify-between items-center px-4 py-4 bg-blue-50 rounded-t-xl">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{inv.invoice_number}
                    </span>
                    {copiedId === inv.id ? (
                      <Check className="h-4 text-green-500" />
                    ) : (
                      <Copy
                        className="h-4 opacity-40 cursor-pointer hover:opacity-70"
                        onClick={() => {
                          if (inv.invoice_number && inv.id) {
                            if (inv.invoice_number && inv.id) {
                              handleCopy(inv.invoice_number, inv.id ?? "");
                            }
                          }
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 font-medium ${
                        inv.is_inter_state 
                          ? "bg-purple-50 text-purple-700 border-purple-200" 
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {inv.is_inter_state ? "Inter State" : "Intra State"}
                    </Badge>
                    <Badge
                      className={`capitalize text-xs px-2 py-0.5 font-medium ${getStatusClasses(
                        inv.status ?? ""
                      )}`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>

                {/* Body */}
                <Link href={`/invoice/${inv.id}/edit`}>
                  <CardContent className="p-4 space-y-4">
                    {/* Amount */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        AMOUNT
                      </p>
                      <p className="text-2xl font-bold">
                        <Currency amount={inv.total} />
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(inv.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {/* Client */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User2 className="w-4 h-4" />
                      <span className="truncate">{inv.to_name}</span>
                    </div>
                  </CardContent>
                </Link>
                {/* Footer with actions */}
                <div className="flex items-center justify-between border-t border-dashed px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (inv.id) {
                        handleDownloadPDF(inv.id);
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>

                  {/* Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          if (inv.public_id) handleShareInvoice(inv.public_id);
                        }}
                        className="cursor-pointer"
                        disabled={!inv.public_id}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Public Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          setSendingEmail(inv.id ?? null);
                          setEmailSent(null);
                          try {
                            if (inv.id) {
                              await handleSendMail(inv.id);
                            }
                            setEmailSent(inv.id ?? null);
                            setTimeout(() => setEmailSent(null), 1000);
                          } catch (err) {
                            console.error("Mail sending failed:", err);
                          } finally {
                            setSendingEmail(null);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {sendingEmail === inv.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : emailSent === inv.id ? (
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Send Mail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (inv.id) handleDeleteClick(inv.id); }}
                        disabled={deletingId === inv.id}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-background hover:shadow-md transition-all duration-200"
              >
                <Link href={`/invoice/${inv.id}/edit`} className="flex-1">
                  <div className="flex items-center gap-6">
                    {/* Invoice Number */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{inv.invoice_number}</span>
                      {copiedId === inv.id ? (
                        <Check className="h-4 text-green-500" />
                      ) : (
                        <Copy
                          className="h-4 opacity-40 cursor-pointer hover:opacity-70"
                          onClick={(e) => {
                            e.preventDefault();
                            if (inv.id) handleCopy(inv.invoice_number, inv.id);
                          }}
                        />
                      )}
                    </div>

                    {/* Client */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{inv.to_name}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(inv.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        <Currency amount={inv.total} />
                      </p>
                    </div>

                    {/* State Type & Status */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-medium ${
                          inv.is_inter_state 
                            ? "bg-purple-50 text-purple-700 border-purple-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {inv.is_inter_state ? "Inter" : "Intra"}
                      </Badge>
                      <Badge
                        className={`capitalize text-xs px-2 py-0.5 font-medium ${getStatusClasses(
                                                  inv.status ?? ""
                                                )}`}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (inv.id) {
                        handleDownloadPDF(inv.id);
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          if (inv.public_id) handleShareInvoice(inv.public_id);
                        }}
                        className="cursor-pointer"
                        disabled={!inv.public_id}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Public Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          setSendingEmail(inv.id ?? null);
                          setEmailSent(null);
                          try {
                            if (inv.id) {
                              await handleSendMail(inv.id);
                              setEmailSent(inv.id);
                              setTimeout(() => setEmailSent(null), 1000);
                            }
                          } catch (err) {
                            console.error("Mail sending failed:", err);
                          } finally {
                            setSendingEmail(null);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {sendingEmail === inv.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : emailSent === inv.id ? (
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Send Mail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (inv.id) handleDeleteClick(inv.id); }}
                        disabled={deletingId === inv.id}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice and remove all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
