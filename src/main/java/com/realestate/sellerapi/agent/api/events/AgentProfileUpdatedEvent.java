package com.realestate.sellerapi.agent.api.events;

import com.realestate.sellerapi.shared.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record AgentProfileUpdatedEvent(
        UUID agentId,
        Instant updatedAt
) implements DomainEvent {
}

