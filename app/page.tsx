"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
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
import { Plus, Trash2, MoreVertical, Download, Search, X } from "lucide-react";
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { generatePDF } from "@/utils/pdf-generator";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { StatusWidgets } from "@/components/StatusWidgets";

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
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      inv.to_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const statusCounts = invoices.reduce(
  (acc, invoice) => {
    const status = invoice.status.toLowerCase();
    if (status === "paid") acc.paid += 1;
    else if (status === "unpaid") acc.unpaid += 1;
    else if (status === "partial") acc.partial += 1;
    else if (status === "overdue") acc.overdue += 1;
    return acc;
  },
  { paid: 0, unpaid: 0, partial: 0, overdue: 0 }
);


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
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
           Welcome Back {user?.firstName || "User"} !
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

      <div className="mb-10 relative w-full max-w-sm">
        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

        {/* Input */}
        <Input
          ref={inputRef}
          placeholder="Search by client or invoice number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20"
        />

        {/* Shortcut hint */}
        <Badge
          variant="outline"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none"
        >
          /
        </Badge>

        {/* Clear button */}
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

        <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="status-widgets">
          <AccordionTrigger className="text-base font-medium">
            Status Summary
          </AccordionTrigger>
          <AccordionContent
  className="transition-all duration-300 will-change-[height] overflow-hidden"
>
  <StatusWidgets
    stats={{ ...statusCounts, total: invoices.length }}
    className="mt-4"
  />
</AccordionContent>

        </AccordionItem>
      </Accordion>

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
