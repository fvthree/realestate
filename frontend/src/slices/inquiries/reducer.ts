import { createSlice } from "@reduxjs/toolkit";
import {
  addAgentMessage,
  addBuyerMessage,
  createInquiry,
  getAgentInquiries,
  getBuyerInquiry,
  updateBuyerInquiry,
  updateInquiryStatus,
} from "./thunk";

export const initialState: any = {
  list: [],
  detail: null,
  meta: null,
  error: null,
  loading: false,
  success: false,
};

const inquiriesSlice = createSlice({
  name: "inquiries",
  initialState,
  reducers: {
    clearInquiryState(state) {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createInquiry.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createInquiry.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createInquiry.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    builder.addCase(getBuyerInquiry.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getBuyerInquiry.fulfilled, (state, action) => {
      state.loading = false;
      state.detail = action.payload;
      state.success = true;
    });
    builder.addCase(getBuyerInquiry.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    builder.addCase(updateBuyerInquiry.fulfilled, (state, action) => {
      state.detail = action.payload;
      state.success = true;
    });
    builder.addCase(addBuyerMessage.fulfilled, (state, action) => {
      if (state.detail) {
        const existing = Array.isArray(state.detail.messages) ? state.detail.messages : [];
        state.detail.messages = [...existing, action.payload];
      }
      state.success = true;
    });

    builder.addCase(getAgentInquiries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAgentInquiries.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload?.data || [];
      state.meta = action.payload?.meta || null;
      state.success = true;
    });
    builder.addCase(getAgentInquiries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    builder.addCase(updateInquiryStatus.fulfilled, (state, action) => {
      const updated = action.payload;
      if (updated?.id) {
        state.list = (state.list || []).map((item: any) => item.id === updated.id ? updated : item);
      }
      state.success = true;
    });

    builder.addCase(addAgentMessage.fulfilled, (state, action) => {
      if (state.detail) {
        const existing = Array.isArray(state.detail.messages) ? state.detail.messages : [];
        state.detail.messages = [...existing, action.payload];
      }
      state.success = true;
    });
  },
});

export const { clearInquiryState } = inquiriesSlice.actions;
export default inquiriesSlice.reducer;
