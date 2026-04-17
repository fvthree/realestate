package com.realestate.sellerapi.inquiry.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record AgentInboxInquiryResponse(
        UUID id,
        @JsonProperty("property_id") UUID propertyId,
        String status,
        @JsonProperty("buyer_name") String buyerName,
        @JsonProperty("buyer_email") String buyerEmail,
        @JsonProperty("buyer_phone") String buyerPhone,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("property_title") String propertyTitle,
        @JsonProperty("cover_image_url") String coverImageUrl
) {
}

