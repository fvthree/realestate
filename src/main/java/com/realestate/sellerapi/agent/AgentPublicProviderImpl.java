package com.realestate.sellerapi.agent;

import com.realestate.sellerapi.property.AgentPublicProvider;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
class AgentPublicProviderImpl implements AgentPublicProvider {

    private final AgentRepository agentRepository;

    AgentPublicProviderImpl(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    @Override
    public AgentPublic getAgentPublic(UUID agentId) {
        return agentRepository.findById(agentId)
                .map(agent -> new AgentPublic(
                        agent.getName(),
                        agent.getPhone(),
                        agent.getAvatarUrl()
                ))
                .orElse(null);
    }
}

