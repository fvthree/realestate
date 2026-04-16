package com.realestate.sellerapi.agent;

import com.realestate.sellerapi.agent.domain.Agent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Agent entity.
 * Package-private - only accessible within the agent module.
 */
public interface AgentRepository extends JpaRepository<Agent, UUID> {

    Optional<Agent> findByEmail(String email);

    Optional<Agent> findTopByOrderByCreatedAtAsc();

    boolean existsByEmail(String email);
}
