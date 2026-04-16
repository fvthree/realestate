package com.realestate.sellerapi.property.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Agent-owned property listing.
 */
@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_property_agent", columnList = "agent_id"),
    @Index(name = "idx_property_status", columnList = "status"),
    @Index(name = "idx_property_price", columnList = "price_php"),
    @Index(name = "idx_property_city", columnList = "city_municipality")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PropertyStatus status = PropertyStatus.DRAFT;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Pricing
    @Column(name = "price_php", nullable = false, precision = 14, scale = 2)
    private BigDecimal pricePhp;

    // Property Attributes
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    private Integer bedrooms;
    private Integer bathrooms;

    @Column(name = "floor_area_sqm", precision = 10, scale = 2)
    private BigDecimal floorAreaSqm;

    @Column(name = "lot_area_sqm", precision = 10, scale = 2)
    private BigDecimal lotAreaSqm;

    // Philippines Address
    private String region;
    private String province;

    @Column(name = "city_municipality")
    private String cityMunicipality;

    private String barangay;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "street_address")
    private String streetAddress;

    // Geo (Optional)
    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    // Lifecycle
    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "sold_at")
    private Instant soldAt;

    // System
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Relationships
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PropertyMedia> media = new ArrayList<>();

    // Helper methods
    public void addMedia(PropertyMedia propertyMedia) {
        media.add(propertyMedia);
        propertyMedia.setProperty(this);
    }

    public void removeMedia(PropertyMedia propertyMedia) {
        media.remove(propertyMedia);
        propertyMedia.setProperty(null);
    }
}

