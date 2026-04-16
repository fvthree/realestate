package com.realestate.sellerapi.property.api.events;

import com.realestate.sellerapi.shared.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record PropertyPublishedEvent(
        UUID propertyId,
        UUID agentId,
        Instant publishedAt
) implements DomainEvent {
}

