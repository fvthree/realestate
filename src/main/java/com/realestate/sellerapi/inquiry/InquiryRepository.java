package com.realestate.sellerapi.inquiry;

import com.realestate.sellerapi.inquiry.domain.Inquiry;
import com.realestate.sellerapi.inquiry.domain.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Inquiry entity.
 * Package-private - only accessible within the inquiry module.
 */
interface InquiryRepository extends JpaRepository<Inquiry, UUID> {

    List<Inquiry> findByAgentId(UUID agentId);

    List<Inquiry> findByAgentIdAndStatus(UUID agentId, InquiryStatus status);

    List<Inquiry> findByPropertyId(UUID propertyId);

    Optional<Inquiry> findByAccessTokenHash(String accessTokenHash);
}

