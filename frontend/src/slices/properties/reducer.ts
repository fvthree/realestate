import { createSlice } from "@reduxjs/toolkit";
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  publishProperty,
  markSoldProperty,
  uploadPropertyMedia,
  deletePropertyMedia,
  reorderPropertyMedia
} from "./thunk";

export const initialState : any = {
  properties: [],
  property: null,
  error: null,
  loading: false,
  success: false,
  message: ""
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    clearPropertyState(state) {
      state.property = null;
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearPropertyError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get Properties
    builder.addCase(getProperties.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProperties.fulfilled, (state, action) => {
      state.loading = false;
      state.properties = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    });
    builder.addCase(getProperties.rejected, (state, action) => {
      state.loading = false;
      // Properly extract error message from various error formats
      const errorPayload = action.payload as any;
      state.error = {
        message: errorPayload?.message || action.error?.message || 'Failed to fetch properties',
        status: errorPayload?.status,
        data: errorPayload?.data
      };
      console.error('[Properties Reducer] getProperties rejected:', state.error);
    });

    // Get Property
    builder.addCase(getProperty.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.property = action.payload;
    });
    builder.addCase(getProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Create Property
    builder.addCase(createProperty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.property = action.payload;
      state.message = "Property created successfully";
    });
    builder.addCase(createProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Update Property
    builder.addCase(updateProperty.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.property = action.payload;
      state.message = "Property updated successfully";
    });
    builder.addCase(updateProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Delete Property
    builder.addCase(deleteProperty.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.properties = state.properties.filter(
        (property: any) => property.id !== action.payload
      );
      state.message = "Property deleted successfully";
    });
    builder.addCase(deleteProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Publish Property
    builder.addCase(publishProperty.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(publishProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.property = action.payload;
      state.message = "Property published successfully";
    });
    builder.addCase(publishProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Mark Sold Property
    builder.addCase(markSoldProperty.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(markSoldProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.property = action.payload;
      state.message = "Property marked as sold";
    });
    builder.addCase(markSoldProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Upload Property Media
    builder.addCase(uploadPropertyMedia.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(uploadPropertyMedia.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      if (state.property) {
        const currentMedia = Array.isArray(state.property.media) ? state.property.media : [];
        state.property = {
          ...state.property,
          media: [...currentMedia, action.payload],
        };
      }
      state.message = "Media uploaded successfully";
    });
    builder.addCase(uploadPropertyMedia.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Delete Property Media
    builder.addCase(deletePropertyMedia.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deletePropertyMedia.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      const deletedMediaId = action.meta?.arg?.mediaId;
      if (state.property && deletedMediaId) {
        const currentMedia = Array.isArray(state.property.media) ? state.property.media : [];
        state.property = {
          ...state.property,
          media: currentMedia.filter((media: any) => media.id !== deletedMediaId),
        };
      }
      state.message = "Media deleted successfully";
    });
    builder.addCase(deletePropertyMedia.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // Reorder Property Media
    builder.addCase(reorderPropertyMedia.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(reorderPropertyMedia.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      const updatedMedia = action.payload;
      if (state.property && updatedMedia?.id) {
        const currentMedia = Array.isArray(state.property.media) ? state.property.media : [];
        state.property = {
          ...state.property,
          media: currentMedia
            .map((media: any) => media.id === updatedMedia.id ? { ...media, ...updatedMedia } : media)
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        };
      }
    });
    builder.addCase(reorderPropertyMedia.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });
  },
});

export const { clearPropertyState, clearPropertyError } = propertiesSlice.actions;

export default propertiesSlice.reducer;

