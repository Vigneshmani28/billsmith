import api from "@/lib/axios";
import { InvoiceData } from "@/types/invoice";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


export const updateInvoice = createAsyncThunk(
  "invoice/updateInvoice",
  async ({ id, data }: { id: string; data: InvoiceData }) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data.invoice;
  }
);

interface InvoiceState {
  current: InvoiceData | null;
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
    setInvoice(state, action: PayloadAction<InvoiceData>) {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      });
  },
});

export const { clearInvoice, setInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
