package com.realestate.sellerapi.agent;

import com.realestate.sellerapi.agent.api.AgentMeResponse;
import com.realestate.sellerapi.agent.api.AgentPublicProfileResponse;
import com.realestate.sellerapi.agent.api.AgentSocialsResponse;
import com.realestate.sellerapi.agent.api.AuthLoginResponse;
import com.realestate.sellerapi.agent.api.UpdateAgentProfileRequest;
import com.realestate.sellerapi.agent.api.events.AgentLoggedInEvent;
import com.realestate.sellerapi.agent.api.events.AgentProfileUpdatedEvent;
import com.realestate.sellerapi.agent.domain.Agent;
import com.realestate.sellerapi.security.JwtService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AgentService {

    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;

    public AgentService(AgentRepository agentRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        ApplicationEventPublisher eventPublisher) {
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.eventPublisher = eventPublisher;
    }

    public AuthLoginResponse login(String email, String password) {
        Agent agent = agentRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(password, agent.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(agent.getId(), agent.getEmail());
        eventPublisher.publishEvent(new AgentLoggedInEvent(agent.getId(), Instant.now()));

        return new AuthLoginResponse(token, "Bearer", jwtService.getExpirationSeconds());
    }

    public AgentMeResponse getMe(UUID agentId) {
        Agent agent = findAgent(agentId);
        return toMeResponse(agent);
    }

    public AgentMeResponse updateProfile(UUID agentId, UpdateAgentProfileRequest request) {
        Agent agent = findAgent(agentId);

        if (request.name() != null) {
            agent.setName(request.name());
        }
        if (request.phone() != null) {
            agent.setPhone(request.phone());
        }
        if (request.bio() != null) {
            agent.setBio(request.bio());
        }
        if (request.serviceAreas() != null) {
            agent.setServiceAreas(request.serviceAreas());
        }
        if (request.avatarUrl() != null) {
            agent.setAvatarUrl(request.avatarUrl());
        }

        Agent saved = agentRepository.save(agent);
        eventPublisher.publishEvent(new AgentProfileUpdatedEvent(saved.getId(), Instant.now()));

        return toMeResponse(saved);
    }

    public AgentPublicProfileResponse getPublicProfile() {
        Optional<Agent> agent = agentRepository.findTopByOrderByCreatedAtAsc();
        if (agent.isEmpty()) {
            throw new AgentNotFoundException();
        }
        return toPublicResponse(agent.get());
    }

    private Agent findAgent(UUID agentId) {
        return agentRepository.findById(agentId)
                .orElseThrow(AgentNotFoundException::new);
    }

    private AgentMeResponse toMeResponse(Agent agent) {
        return new AgentMeResponse(
                agent.getId(),
                agent.getEmail(),
                agent.getName(),
                agent.getPhone(),
                agent.getBio(),
                agent.getServiceAreas(),
                agent.getAvatarUrl(),
                new AgentSocialsResponse(
                        agent.getFacebookUrl(),
                        agent.getInstagramUrl(),
                        agent.getWebsiteUrl()
                ),
                agent.getCreatedAt(),
                agent.getUpdatedAt()
        );
    }

    private AgentPublicProfileResponse toPublicResponse(Agent agent) {
        return new AgentPublicProfileResponse(
                agent.getName(),
                agent.getPhone(),
                agent.getBio(),
                agent.getServiceAreas(),
                agent.getAvatarUrl(),
                new AgentSocialsResponse(
                        agent.getFacebookUrl(),
                        agent.getInstagramUrl(),
                        agent.getWebsiteUrl()
                )
        );
    }
}

