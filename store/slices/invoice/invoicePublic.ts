import api from "@/lib/axios";
import { InvoiceData } from "@/types/invoice";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Slice state
interface InvoiceState {
  invoice: InvoiceData | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoice: null,
  loading: false,
  error: null,
};

// ---------------------- Async Thunk ----------------------
export const fetchInvoiceByPublicId = createAsyncThunk<
  InvoiceData,
  string,
  { rejectValue: string }
>("invoice/fetchInvoiceByPublicId", async (publicId) => {

    const response = await api.get(`/invoices/public/${publicId}`);
    const data = response.data.data;

    // Map API fields to InvoiceData interface
    const invoice: InvoiceData = {
      id: data._id,
      user_id: data.user_id,
      invoice_number: data.invoice_number,
      date: data.date,
      from_name: data.from_name,
      from_email: data.from_email,
      to_name: data.to_name,
      to_email: data.to_email,
      to_address: data.to_address,
      status: data.status,
      items: data.items,
      tax_rate: data.tax_rate,
      discount: data.discount,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      total: data.total,
      public_id: data.public_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return invoice;
  
});

// ---------------------- Slice ----------------------
const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoice(state) {
      state.invoice = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInvoiceByPublicId.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceByPublicId.fulfilled, (state, action: PayloadAction<InvoiceData>) => {
        state.loading = false;
        state.invoice = action.payload;
      })
      .addCase(fetchInvoiceByPublicId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch invoice";
      });
  },
});

export const { clearInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
