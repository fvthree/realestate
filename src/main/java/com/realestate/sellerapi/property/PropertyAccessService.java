package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.api.PropertyAccess;
import com.realestate.sellerapi.property.api.PropertySummary;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
class PropertyAccessService implements PropertyAccess {

    private final PropertyRepository propertyRepository;

    PropertyAccessService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Optional<PropertySummary> findPublishedProperty(UUID propertyId) {
        return propertyRepository.findById(propertyId)
                .filter(property -> property.getStatus() == PropertyStatus.PUBLISHED)
                .map(this::toSummary);
    }

    private PropertySummary toSummary(Property property) {
        return new PropertySummary(
                property.getId(),
                property.getAgentId(),
                property.getTitle(),
                property.getStatus().name()
        );
    }
}

