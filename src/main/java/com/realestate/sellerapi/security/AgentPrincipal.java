package com.realestate.sellerapi.security;

import java.util.UUID;

public record AgentPrincipal(
        UUID agentId,
        String email
) {
}

