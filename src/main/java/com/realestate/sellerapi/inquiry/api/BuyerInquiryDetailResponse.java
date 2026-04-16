package com.realestate.sellerapi.inquiry.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record BuyerInquiryDetailResponse(
        UUID id,
        @JsonProperty("property_id") UUID propertyId,
        String status,
        BuyerInfo buyer,
        java.util.List<MessageInfo> messages
) {
    public record BuyerInfo(
            @JsonProperty("buyer_name") String buyerName,
            @JsonProperty("buyer_email") String buyerEmail,
            @JsonProperty("buyer_phone") String buyerPhone
    ) {}

    public record MessageInfo(
            UUID id,
            @JsonProperty("sender_type") String senderType,
            String body,
            @JsonProperty("created_at") Instant createdAt
    ) {}
}

