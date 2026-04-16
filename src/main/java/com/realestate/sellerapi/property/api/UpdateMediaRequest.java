package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateMediaRequest(
        @JsonProperty("sort_order") Integer sortOrder,
        @JsonProperty("is_cover") Boolean isCover
) {
}

