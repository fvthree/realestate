package com.realestate.sellerapi.inquiry.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        @JsonProperty("sender_type") String senderType,
        String body,
        @JsonProperty("created_at") Instant createdAt
) {
}

