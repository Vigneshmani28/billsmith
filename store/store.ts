import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import invoiceReducer from "./slices/invoice/invoiceSlice";
import singleInvoiceReducer from "./slices/invoice/invoiceByIdSlice";
import updateInvoiceReducer from "./slices/invoice/updateInvoice";
import createInvoiceReducer from "./slices/invoice/createInvoice";
import fetchPublicInvoice from "./slices/invoice/invoicePublic";
import confirmRegistrationReducer from "./slices/auth/confirmRegistrationSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    invoiceById: singleInvoiceReducer,
    updateInvoice: updateInvoiceReducer,
    createInvoice: createInvoiceReducer,
    publicInvoice: fetchPublicInvoice,
    confirmRegistration: confirmRegistrationReducer,
  },
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
