package com.realestate.sellerapi.agent.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents the single seller/agent in the system.
 * Solo seller: exactly one Agent account in the system (enforced by app logic).
 */
@Entity
@Table(name = "agents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "prc_license_no")
    private String prcLicenseNo;

    @Column(name = "service_areas", columnDefinition = "TEXT")
    private String serviceAreas; // freeform or comma-separated list

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "facebook_url", columnDefinition = "TEXT")
    private String facebookUrl;

    @Column(name = "instagram_url", columnDefinition = "TEXT")
    private String instagramUrl;

    @Column(name = "website_url", columnDefinition = "TEXT")
    private String websiteUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

