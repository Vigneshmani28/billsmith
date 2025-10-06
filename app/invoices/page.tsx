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
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    undefined
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    undefined
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 0);

  const dispatch = useDispatch<AppDispatch>();

  const {
    items: invoices,
    loading: invoiceLoading,
    error,
  } = useSelector((state: RootState) => state.invoices);

  useEffect(() => {
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
      inv.to_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    // 2️⃣ Status filter
    const matchesStatus =
      !statusFilter || inv.status.toLowerCase() === statusFilter.toLowerCase();

    // 3️⃣ Date filter
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

    return matchesSearch && matchesStatus && matchesDate;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("");
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

        {/* Right side: Filters */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              {/* Start Date */}
              <div className="w-36">
                <DatePicker
                  selectedDate={customStartDate}
                  onSelect={(date) => setCustomStartDate(date ?? undefined)}
                />
              </div>
              <span className="text-sm text-muted-foreground">-</span>
              {/* End Date */}
              <div className="w-36">
                <DatePicker
                  selectedDate={customEndDate}
                  onSelect={(date) => setCustomEndDate(date ?? undefined)}
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Invoice status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {(searchTerm ||
            dateFilter ||
            statusFilter ||
            customStartDate ||
            customEndDate) && (
            <Button variant="destructive" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {invoiceLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredInvoices.map((inv) => (
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
                      onClick={() => handleCopy(inv.invoice_number, inv.id)}
                    />
                  )}
                </div>

                <Badge
                  className={`capitalize text-xs px-2 py-0.5 font-medium ${getStatusClasses(
                    inv.status
                  )}`}
                >
                  {inv.status}
                </Badge>
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
                    handleDownloadPDF(inv.id);
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
                      onClick={() => handleShareInvoice(inv.public_id)}
                      className="cursor-pointer"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Copy Public Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        setSendingEmail(inv.id);
                        setEmailSent(null);
                        try {
                          await handleSendMail(inv.id);
                          setEmailSent(inv.id);
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
                      onClick={() => handleDeleteClick(inv.id)}
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
          ))}
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
