package com.realestate.sellerapi.inquiry;

import com.realestate.sellerapi.inquiry.domain.ConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for ConversationMessage entity.
 * Package-private - only accessible within the inquiry module.
 */
interface ConversationMessageRepository extends JpaRepository<ConversationMessage, UUID> {

    List<ConversationMessage> findByInquiryIdOrderByCreatedAtAsc(UUID inquiryId);
}

