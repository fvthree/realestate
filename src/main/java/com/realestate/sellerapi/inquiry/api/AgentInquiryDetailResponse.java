package com.realestate.sellerapi.inquiry.api;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full inquiry thread for the authenticated listing agent (all messages).
 */
public record AgentInquiryDetailResponse(
        UUID id,
        @JsonProperty("property_id") UUID propertyId,
        String status,
        @JsonProperty("property_title") String propertyTitle,
        @JsonProperty("cover_image_url") String coverImageUrl,
        @JsonProperty("price_php") BigDecimal pricePHP,
        @JsonProperty("property_type") String propertyType,
        Integer bedrooms,
        Integer bathrooms,
        @JsonProperty("city_municipality") String cityMunicipality,
        String province,
        @JsonProperty("buyer_name") String buyerName,
        @JsonProperty("buyer_email") String buyerEmail,
        @JsonProperty("buyer_phone") String buyerPhone,
        List<MessageInfo> messages
) {
    public record MessageInfo(
            UUID id,
            @JsonProperty("sender_type") String senderType,
            String body,
            @JsonProperty("created_at") Instant createdAt
    ) {
    }
}

