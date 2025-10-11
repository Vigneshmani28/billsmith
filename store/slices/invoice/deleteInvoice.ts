import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/axios";


export const deleteInvoice = createAsyncThunk(
  "invoice/deleteInvoice",
  async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  }
);