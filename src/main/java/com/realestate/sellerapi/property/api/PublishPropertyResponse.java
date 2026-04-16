package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record PublishPropertyResponse(
        UUID id,
        String status,
        @JsonProperty("published_at") Instant publishedAt
) {
}

