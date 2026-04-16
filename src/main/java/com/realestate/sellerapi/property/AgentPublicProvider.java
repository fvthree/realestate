package com.realestate.sellerapi.property;

import java.util.UUID;

public interface AgentPublicProvider {
    record AgentPublic(String name, String phone, String avatarUrl) {}

    AgentPublic getAgentPublic(UUID agentId);
}

