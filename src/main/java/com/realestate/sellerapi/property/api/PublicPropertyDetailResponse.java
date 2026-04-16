package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PublicPropertyDetailResponse(
        UUID id,
        String title,
        String description,
        @JsonProperty("price_php") BigDecimal pricePHP,
        String status,
        @JsonProperty("property_type") String propertyType,
        Integer bedrooms,
        Integer bathrooms,
        @JsonProperty("floor_area_sqm") BigDecimal floorAreaSqm,
        AddressDetail address,
        GeoDetail geo,
        List<MediaDetail> media,
        AgentDetail agent
) {
    public record AddressDetail(
            String region,
            String province,
            @JsonProperty("city_municipality") String cityMunicipality,
            String barangay,
            @JsonProperty("postal_code") String postalCode,
            @JsonProperty("street_address") String streetAddress
    ) {
    }

    public record GeoDetail(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
    }

    public record MediaDetail(
            UUID id,
            String url,
            @JsonProperty("sort_order") int sortOrder,
            @JsonProperty("is_cover") boolean isCover
    ) {
    }

    public record AgentDetail(
            String name,
            String phone,
            @JsonProperty("avatar_url") String avatarUrl
    ) {
    }
}

