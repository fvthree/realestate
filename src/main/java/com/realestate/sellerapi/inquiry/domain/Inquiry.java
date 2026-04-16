package com.realestate.sellerapi.inquiry.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Anonymous buyer inquiry/lead linked to a property.
 * Buyers access their inquiry using a magic-link token (stored as hash).
 */
@Entity
@Table(name = "inquiries", indexes = {
    @Index(name = "idx_inquiry_agent_status", columnList = "agent_id, status"),
    @Index(name = "idx_inquiry_property", columnList = "property_id"),
    @Index(name = "idx_inquiry_token", columnList = "access_token_hash", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    // Buyer contact
    @Column(name = "buyer_name")
    private String buyerName;

    @Column(name = "buyer_email")
    private String buyerEmail;

    @Column(name = "buyer_phone")
    private String buyerPhone;

    // Inquiry content
    @Column(name = "initial_message", nullable = false, columnDefinition = "TEXT")
    private String initialMessage;

    // Lead workflow
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.NEW;

    @Column(name = "last_contacted_at")
    private Instant lastContactedAt;

    // Magic link - store only hash for security
    @Column(name = "access_token_hash", nullable = false, unique = true)
    private String accessTokenHash;

    @Column(name = "access_token_expires_at")
    private Instant accessTokenExpiresAt; // optional; can be null for non-expiring tokens

    @Column(name = "token_rotated_at")
    private Instant tokenRotatedAt;

    // System
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Relationships
    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ConversationMessage> messages = new ArrayList<>();

    // Helper methods
    public void addMessage(ConversationMessage message) {
        messages.add(message);
        message.setInquiry(this);
    }

    public void removeMessage(ConversationMessage message) {
        messages.remove(message);
        message.setInquiry(null);
    }
}

