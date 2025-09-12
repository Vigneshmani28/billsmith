// features/auth/confirmRegistrationSlice.ts
import api from "@/lib/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ConfirmState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ConfirmState = {
  loading: false,
  success: false,
  error: null,
};

// 🔥 Thunk
export const confirmRegistration = createAsyncThunk<
  any, // return type (API response)
  { token: string; name: string; password: string; confirmPassword: string }, // payload type
  { rejectValue: string } // error type
>(
  "auth/confirmRegistration",
  async ({ token, name, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post("/user/register/confirm", {
        token,
        name,
        password,
        confirmPassword,
      });

      if (res.data?.success) {
        return res.data;
      } else {
        return rejectWithValue(res.data?.message || "Something went wrong");
      }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid or expired token"
      );
    }
  }
);

const confirmRegistrationSlice = createSlice({
  name: "confirmRegistration",
  initialState,
  reducers: {
    resetConfirmState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmRegistration.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(confirmRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(confirmRegistration.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to confirm registration";
      });
  },
});

export const { resetConfirmState } = confirmRegistrationSlice.actions;
export default confirmRegistrationSlice.reducer;
