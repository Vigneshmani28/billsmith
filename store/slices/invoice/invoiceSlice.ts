import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

type Invoice = {
  id: string;
  invoice_number : string;
  date: string;
  to_name: string;
  to_email: string;
  status: string;
  total: number;
  public_id: string;
};

type InvoiceState = {
  items: Invoice[];
  loading: boolean;
  error: string | null;
};

const initialState: InvoiceState = {
  items: [],
  loading: false,
  error: null,
};

// Example: fetch invoices
export const fetchInvoices = createAsyncThunk("invoices/fetch", async () => {
  const res = await api.get("/invoices");
  return res.data; // expects array
});

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoices";
      });
  },
});


export default invoiceSlice.reducer;
