import api from "@/lib/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  invoice_number: string;
  date: string; 
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  to_address: string;
  tax_rate: number;
  discount: number;
  items: InvoiceItem[];
}

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async ({data }: {data: Invoice }) => {
    const response = await api.post(`/invoices`, data);
    return response.data.data;
  }
);

interface InvoiceState {
  current: Invoice | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  current: null,
  loading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoice(state) {
      state.current = null;
      state.error = null;
    },
    setInvoice(state, action: PayloadAction<Invoice>) {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const { clearInvoice, setInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
