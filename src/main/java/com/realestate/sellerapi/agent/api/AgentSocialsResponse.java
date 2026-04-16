package com.realestate.sellerapi.agent.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgentSocialsResponse(
        @JsonProperty("facebook_url") String facebookUrl,
        @JsonProperty("instagram_url") String instagramUrl,
        @JsonProperty("website_url") String websiteUrl
) {
}

