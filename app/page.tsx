"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { fetchUserInvoices, deleteInvoiceFromDB } from "@/lib/supabase/fetchInvoices";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MoreVertical } from "lucide-react";
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
  items: InvoiceItem[];
  tax_rate: number;
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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Invoices</h1>
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
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12 sm:mt-20 gap-4">
          <div className="text-center text-muted-foreground text-base sm:text-lg">
            No invoices found. Create your first invoice to get started.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {invoices.map((inv) => (
            <Card key={inv.id} className="relative">
              <Link href={`/invoice/${inv.id}/edit`} className="block p-4 sm:p-6">
                <CardHeader className="p-0 mb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{inv.invoice_number}</CardTitle>
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
                    <span className="truncate max-w-[120px]">{inv.to_name}</span>
                  </div>
                </CardContent>
              </Link>

              {/* Dropdown menu for more actions */}
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
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(inv.id)}
                    disabled={deletingId === inv.id}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> {/* 👈 Add this class */}
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
              This action cannot be undone. This will permanently delete the invoice and remove all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
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
