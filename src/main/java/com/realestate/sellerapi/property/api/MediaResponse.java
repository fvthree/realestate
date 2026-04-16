package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record MediaResponse(
        UUID id,
        UUID propertyId,
        @JsonProperty("public_url") String publicUrl,
        @JsonProperty("sort_order") int sortOrder,
        @JsonProperty("is_cover") boolean isCover
) {
}

