package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PropertyResponse(
        UUID id,
        String title,
        String description,
        @JsonProperty("price_php") BigDecimal pricePHP,
        String status,
        @JsonProperty("property_type") String propertyType,
        Integer bedrooms,
        Integer bathrooms,
        @JsonProperty("floor_area_sqm") BigDecimal floorAreaSqm,
        @JsonProperty("lot_area_sqm") BigDecimal lotAreaSqm,
        AddressResponse address,
        GeoResponse geo,
        @JsonProperty("published_at") Instant publishedAt,
        @JsonProperty("sold_at") Instant soldAt,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public record AddressResponse(
            String region,
            String province,
            @JsonProperty("city_municipality") String cityMunicipality,
            String barangay,
            @JsonProperty("postal_code") String postalCode,
            @JsonProperty("street_address") String streetAddress
    ) {
    }

    public record GeoResponse(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
    }
}

