package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PaginatedPropertyResponse(
        List<PropertySummaryItem> data,
        MetaResponse meta
) {
    public record PropertySummaryItem(
            String id,
            String title,
            String status,
            @JsonProperty("price_php") java.math.BigDecimal pricePHP,
            @JsonProperty("property_type") String propertyType,
            Integer bedrooms,
            Integer bathrooms,
            AddressItem address,
            @JsonProperty("cover_image_url") String coverImageUrl,
            @JsonProperty("sold_at") java.time.Instant soldAt,
            @JsonProperty("created_at") java.time.Instant createdAt
    ) {
        public record AddressItem(
                @JsonProperty("city_municipality") String cityMunicipality,
                String province
        ) {
        }
    }

    public record MetaResponse(
            int page,
            @JsonProperty("per_page") int perPage,
            int total
    ) {
    }
}

