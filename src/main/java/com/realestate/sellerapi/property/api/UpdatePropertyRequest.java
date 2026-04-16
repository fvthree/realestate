package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record UpdatePropertyRequest(
        String title,
        String description,
        @JsonProperty("price_php") BigDecimal pricePHP,
        @JsonProperty("property_type") String propertyType,
        Integer bedrooms,
        Integer bathrooms,
        @JsonProperty("floor_area_sqm") BigDecimal floorAreaSqm,
        @JsonProperty("lot_area_sqm") BigDecimal lotAreaSqm,
        AddressRequest address,
        GeoRequest geo
) {
    public record AddressRequest(
            String region,
            String province,
            @JsonProperty("city_municipality") String cityMunicipality,
            String barangay,
            @JsonProperty("postal_code") String postalCode,
            @JsonProperty("street_address") String streetAddress
    ) {
    }

    public record GeoRequest(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
    }
}

