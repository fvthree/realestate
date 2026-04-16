package com.realestate.sellerapi.inquiry.api.events;

import java.time.Instant;
import java.util.UUID;

public record InquiryCreatedEvent(
        UUID inquiryId,
        UUID propertyId,
        UUID agentId,
        Instant createdAt
) {
}

