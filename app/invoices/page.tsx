"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  fetchUserInvoices,
  deleteInvoiceFromDB,
} from "@/lib/supabase/fetchInvoices";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/CustomDateFilter";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  user_id: string;
  invoice_number: string;
  date: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  to_address: string;
  status: string;
  items: InvoiceItem[];
  tax_rate: number;
  discount: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export default function HomePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null); // invoice id
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 0);

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
    if (!isLoaded) return;
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const loadInvoices = async () => {
      try {
        const data = await fetchUserInvoices(userId);
        setInvoices(data);
      } catch (error) {
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [userId, isLoaded]);

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    try {
      setDeletingId(invoiceToDelete);
      await deleteInvoiceFromDB(invoiceToDelete);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete));
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
    inv.invoice_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    inv.to_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

  // 2️⃣ Status filter
  const matchesStatus =
    !statusFilter || inv.status.toLowerCase() === statusFilter.toLowerCase();

  // 3️⃣ Date filter
  const matchesDate = (() => {
    if (!dateFilter) return true;

    const invoiceDate = new Date(inv.date);

    if (dateFilter === "today") {
      const today = new Date();
      return invoiceDate.toDateString() === today.toDateString();
    }

    if (dateFilter === "this_week") {
      const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return invoiceDate >= startOfWeek && invoiceDate <= endOfWeek;
    }

    if (dateFilter === "this_month") {
      const today = new Date();
    return (
      invoiceDate.getMonth() === today.getMonth() &&
      invoiceDate.getFullYear() === today.getFullYear()
    );
    }

    if (dateFilter === "custom") {
    if (customStartDate && customEndDate) {
      return invoiceDate >= customStartDate && invoiceDate <= customEndDate;
    }
  }

    return true; // For "custom" or not implemented
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



  const getVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "paid";
      case "partial":
        return "partial";
      case "overdue":
        return "overdue";
      default:
        return "unpaid";
    }
  };

  const handleSendMail = async (invoice: InvoiceData) => {
  try {
    await fetch("/api/send-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice }),
    });
    toast.success("Invoice email sent successfully!");
  } catch (error) {
    toast.error("Failed to send invoice email");
    console.error("Failed to send email:", error);
  }
};


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
        <SelectItem value="partial">Partial</SelectItem>
        <SelectItem value="overdue">Overdue</SelectItem>
      </SelectContent>
    </Select>

    {/* Reset Button */}
    { (searchTerm || dateFilter || statusFilter || customStartDate || customEndDate) && (
      <Button variant="destructive" onClick={resetFilters}>
      Reset Filters
    </Button>
    )}
  </div>
</div>



      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-full mt-2" />
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
            <Card
              key={inv.id}
              className="relative border border-transparent hover:border-border hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 bg-background"
            >
              <Link
                href={`/invoice/${inv.id}/edit`}
                className="block p-4 sm:p-6"
              >
                <CardHeader className="p-0 mb-3">
                  <div className="flex justify-between items-start">
                    {/* Left: Invoice Number and Status */}
                    <div>
                      <CardTitle className="text-lg">
                        #{inv.invoice_number}
                      </CardTitle>
                      <Badge
                        variant={getVariant(inv.status)}
                        className="text-xs capitalize mt-1"
                      >
                        {inv.status}
                      </Badge>
                    </div>

                    {/* Right: Total */}
                    <Badge variant="secondary" className="text-sm">
                      ₹{inv.total.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0 text-sm text-muted-foreground space-y-1.5">
                  <div className="flex gap-2">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(inv.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Client:</span>
                    <span className="truncate max-w-[120px]">
                      {inv.to_name}
                    </span>
                  </div>
                </CardContent>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
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
                    onClick={() => generatePDF(inv)}
                    className="cursor-pointer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(inv.id)}
                    disabled={deletingId === inv.id}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                    onClick={async () => {
                      setSendingEmail(inv.id);
                      setEmailSent(null);

                      try {
                        await handleSendMail(inv);
                        setEmailSent(inv.id);
                        setTimeout(() => {
                          setEmailSent(null);
                        }, 1000);
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
                    Send mail
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
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
