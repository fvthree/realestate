package com.realestate.sellerapi.property.api;

import com.realestate.sellerapi.property.PropertyNotFoundException;
import com.realestate.sellerapi.property.PropertyPublicService;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/properties")
public class PublicPropertyController {

    private final PropertyPublicService propertyPublicService;

    public PublicPropertyController(PropertyPublicService propertyPublicService) {
        this.propertyPublicService = propertyPublicService;
    }

    @GetMapping
    public ResponseEntity<?> listPublished(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, name = "property_type") String propertyType,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20", name = "per_page") int perPage) {
        if (perPage > 100) {
            perPage = 100;
        }
        try {
            PaginatedPropertyResponse response = propertyPublicService.listPublishedProperties(
                    city, province, minPrice, maxPrice, propertyType, bedrooms, page, perPage);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Invalid query parameters"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyDetail(@PathVariable UUID id) {
        try {
            PublicPropertyDetailResponse response = propertyPublicService.getPropertyDetail(id);
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        }
    }
}

