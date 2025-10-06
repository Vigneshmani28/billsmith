import api from "@/lib/axios";
import { OwnerInfo } from "@/types/invoice";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type OwnerInfoState = {
  info: OwnerInfo | null;
  loading: boolean;
  error: string | null;
};

const initialState: OwnerInfoState = {
  info: null,
  loading: false,
  error: null,
};

// ✅ Fetch owner info
export const fetchOwnerInfo = createAsyncThunk("ownerInfo/fetch", async () => {
  const res = await api.get("/user/get-owner-info");
  return res.data; // expects { ownerInfo: ... }
});

// ✅ Update owner info
export const updateOwnerInfo = createAsyncThunk(
  "ownerInfo/update",
  async (payload: Partial<OwnerInfo>, { rejectWithValue }) => {
    try {
      const res = await api.put("/user/update-owner-info", payload);
      return res.data.user; // updated user object
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update owner info");
    }
  }
);

const ownerInfoSlice = createSlice({
  name: "ownerInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch owner info
    builder
      .addCase(fetchOwnerInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOwnerInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload.ownerInfo;
      })
      .addCase(fetchOwnerInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch owner info";
      });

    // Update owner info
    builder
      .addCase(updateOwnerInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOwnerInfo.fulfilled, (state, action: PayloadAction<OwnerInfo>) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(updateOwnerInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ownerInfoSlice.reducer;
