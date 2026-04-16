import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addAgentInquiryMessage,
  addBuyerInquiryMessage,
  createInquiry as createInquiryApi,
  getAgentInquiries as getAgentInquiriesApi,
  getBuyerInquiry as getBuyerInquiryApi,
  updateAgentInquiry as updateAgentInquiryApi,
  updateBuyerInquiry as updateBuyerInquiryApi,
} from "../../helpers/fakebackend_helper";

const normalizeError = (error: any) => ({
  message: error?.message || "Request failed",
  status: error?.status,
  data: error?.data || error?.response?.data,
});

const unwrapResponse = (response: any) => {
  if (!response) return response;
  if (response.data !== undefined && response.status !== undefined) {
    return response.data;
  }
  return response;
};

export const createInquiry = createAsyncThunk(
  "inquiries/createInquiry",
  async (payload: { propertyId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await createInquiryApi(payload.propertyId, payload.data);
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const getBuyerInquiry = createAsyncThunk(
  "inquiries/getBuyerInquiry",
  async (payload: { inquiryId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await getBuyerInquiryApi(payload.inquiryId, payload.token);
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const updateBuyerInquiry = createAsyncThunk(
  "inquiries/updateBuyerInquiry",
  async (payload: { inquiryId: string; token: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateBuyerInquiryApi(payload.inquiryId, payload.token, payload.data);
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const addBuyerMessage = createAsyncThunk(
  "inquiries/addBuyerMessage",
  async (payload: { inquiryId: string; token: string; body: string }, { rejectWithValue }) => {
    try {
      const response = await addBuyerInquiryMessage(payload.inquiryId, payload.token, { body: payload.body });
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const getAgentInquiries = createAsyncThunk(
  "inquiries/getAgentInquiries",
  async (params: any = undefined, { rejectWithValue }) => {
    try {
      const response = await getAgentInquiriesApi(params);
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const updateInquiryStatus = createAsyncThunk(
  "inquiries/updateInquiryStatus",
  async (payload: { inquiryId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await updateAgentInquiryApi(payload.inquiryId, { status: payload.status });
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const addAgentMessage = createAsyncThunk(
  "inquiries/addAgentMessage",
  async (payload: { inquiryId: string; body: string }, { rejectWithValue }) => {
    try {
      const response = await addAgentInquiryMessage(payload.inquiryId, { body: payload.body });
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);
