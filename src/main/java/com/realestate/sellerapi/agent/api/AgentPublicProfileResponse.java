package com.realestate.sellerapi.agent.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgentPublicProfileResponse(
        String name,
        String phone,
        String bio,
        @JsonProperty("service_areas") String serviceAreas,
        @JsonProperty("avatar_url") String avatarUrl,
        AgentSocialsResponse socials
) {
}

