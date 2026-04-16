package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record MarkSoldResponse(
        UUID id,
        String status,
        @JsonProperty("sold_at") Instant soldAt
) {
}

