package com.realestate.sellerapi.property.api;

import java.util.UUID;

public record PropertySummary(
        UUID id,
        UUID agentId,
        String title,
        String status
) {
}

