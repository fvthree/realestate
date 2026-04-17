package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Property entity.
 * Package-private - only accessible within the property module.
 */
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    List<Property> findByAgentId(UUID agentId);

    List<Property> findByAgentIdAndStatus(UUID agentId, PropertyStatus status);

    List<Property> findByStatus(PropertyStatus status);

    long countByAgentIdAndStatus(UUID agentId, PropertyStatus status);

    boolean existsByAgentIdAndTitle(UUID agentId, String title);
}

