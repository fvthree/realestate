package com.realestate.sellerapi.property.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Images (and later videos/docs) for a property.
 */
@Entity
@Table(name = "property_media", indexes = {
    @Index(name = "idx_media_property", columnList = "property_id"),
    @Index(name = "idx_media_property_sort", columnList = "property_id, sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    @Builder.Default
    private MediaType mediaType = MediaType.IMAGE;

    @Column(name = "storage_key", nullable = false, columnDefinition = "TEXT")
    private String storageKey; // object storage key/path

    @Column(name = "public_url", columnDefinition = "TEXT")
    private String publicUrl; // if using public buckets/CDN

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_cover", nullable = false)
    @Builder.Default
    private Boolean isCover = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

