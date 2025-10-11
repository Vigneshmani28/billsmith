// store/slices/invoiceSlice.ts
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
export const fetchInvoiceById = createAsyncThunk<
  InvoiceData,
  string,
  { rejectValue: string }
>("invoice/fetchById", async (id) => {

    const response = await api.get(`/invoices/${id}`);
    const data = response.data.data;

    // Map API fields to InvoiceData interface
    const invoice: InvoiceData = {
      id: data._id,
      user_id: data.user_id,
      invoice_number: data.invoice_number,
      date: data.date,
      from_name: data.from_name,
      from_email: data.from_email,
      from_address : data.from_address,
      from_phone : data.from_phone,
      from_gstin : data.from_gstin,
      from_pan : data.from_pan,
      to_name: data.to_name,
      to_email: data.to_email,
      to_address: data.to_address,
      to_phone : data.to_phone,
      to_gstin : data.to_gstin,
      to_pan : data.to_pan,
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
      is_inter_state: false
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
      .addCase(fetchInvoiceById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action: PayloadAction<InvoiceData>) => {
        state.loading = false;
        state.invoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch invoice";
      });
  },
});

export const { clearInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
