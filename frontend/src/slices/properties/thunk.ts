import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getProperties as getPropertiesApi,
  getProperty as getPropertyApi,
  createProperty as createPropertyApi,
  updateProperty as updatePropertyApi,
  deleteProperty as deletePropertyApi,
  publishProperty as publishPropertyApi,
  markSoldProperty as markSoldPropertyApi,
  uploadPropertyMediaFile as uploadPropertyMediaFileApi,
  deletePropertyMedia as deletePropertyMediaApi,
  reorderPropertyMedia as reorderPropertyMediaApi
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

const extractProperties = (response: any): any[] => {
  const payload = unwrapResponse(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.properties)) return payload.properties;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

export const getProperties = createAsyncThunk(
  "properties/getProperties",
  async (params: any = undefined, { rejectWithValue }) => {
    try {
      const response = await getPropertiesApi(params);
      return extractProperties(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const getProperty = createAsyncThunk(
  "properties/getProperty",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getPropertyApi(id);
      return unwrapResponse(response);
    } catch (error: any) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const createProperty = createAsyncThunk(
  "properties/createProperty",
  async (property: any, { rejectWithValue }) => {
    try {
      const response = await createPropertyApi(property);
      toast.success("Property draft saved successfully", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to create property", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const updateProperty = createAsyncThunk(
  "properties/updateProperty",
  async (data: { id: string, property: any }, { rejectWithValue }) => {
    try {
      const response = await updatePropertyApi(data.id, data.property);
      toast.success("Property updated successfully", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to update property", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const deleteProperty = createAsyncThunk(
  "properties/deleteProperty",
  async (id: string, { rejectWithValue }) => {
    try {
      await deletePropertyApi(id);
      toast.success("Property deleted successfully", { autoClose: 3000 });
      return id;
    } catch (error: any) {
      toast.error("Failed to delete property", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const publishProperty = createAsyncThunk(
  "properties/publishProperty",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await publishPropertyApi(id);
      toast.success("Property published successfully", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to publish property", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const markSoldProperty = createAsyncThunk(
  "properties/markSoldProperty",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await markSoldPropertyApi(id);
      toast.success("Property marked as sold", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to mark property as sold", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const uploadPropertyMedia = createAsyncThunk(
  "properties/uploadPropertyMedia",
  async (data: { id: string, file: File, isCover?: boolean }, { rejectWithValue }) => {
    try {
      const response = await uploadPropertyMediaFileApi(data.id, data.file, data.isCover);
      toast.success("Media uploaded successfully", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to upload media", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const deletePropertyMedia = createAsyncThunk(
  "properties/deletePropertyMedia",
  async (data: { propertyId: string, mediaId: string }, { rejectWithValue }) => {
    try {
      const response = await deletePropertyMediaApi(data.propertyId, data.mediaId);
      toast.success("Media deleted successfully", { autoClose: 3000 });
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to delete media", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const reorderPropertyMedia = createAsyncThunk(
  "properties/reorderPropertyMedia",
  async (data: { propertyId: string, mediaId: string, payload: { sort_order?: number, is_cover?: boolean } }, { rejectWithValue }) => {
    try {
      const response = await reorderPropertyMediaApi(data.propertyId, data.mediaId, data.payload);
      return unwrapResponse(response);
    } catch (error: any) {
      toast.error("Failed to reorder media", { autoClose: 3000 });
      return rejectWithValue(normalizeError(error));
    }
  }
);
