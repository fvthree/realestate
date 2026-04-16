package com.realestate.sellerapi.agent.api;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record AgentMeResponse(
        UUID id,
        String email,
        String name,
        String phone,
        String bio,
        @JsonProperty("service_areas") String serviceAreas,
        @JsonProperty("avatar_url") String avatarUrl,
        AgentSocialsResponse socials,
        @JsonProperty("created_at") Instant createdAt,
        @JsonProperty("updated_at") Instant updatedAt
) {
}

