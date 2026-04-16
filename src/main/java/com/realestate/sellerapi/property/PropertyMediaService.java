package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.domain.PropertyMedia;
import com.realestate.sellerapi.property.domain.Property;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PropertyMediaService {

    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;

    public PropertyMediaService(PropertyRepository propertyRepository,
                               PropertyMediaRepository propertyMediaRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaRepository = propertyMediaRepository;
    }

    public PropertyMedia addMedia(UUID agentId, UUID propertyId, String storageKey, String publicUrl) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find max sort order
        var existingMedia = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);
        int nextSortOrder = existingMedia.isEmpty() ? 0 : existingMedia.get(existingMedia.size() - 1).getSortOrder() + 1;

        // Create media
        PropertyMedia media = PropertyMedia.builder()
                .property(property)
                .storageKey(storageKey)
                .publicUrl(publicUrl)
                .sortOrder(nextSortOrder)
                .isCover(false)
                .build();

        return propertyMediaRepository.save(media);
    }

    public PropertyMedia updateMedia(UUID agentId, UUID propertyId, UUID mediaId, Integer sortOrder, Boolean isCover) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find media
        PropertyMedia media = propertyMediaRepository.findById(mediaId)
                .orElseThrow(PropertyMediaNotFoundException::new);

        if (!media.getProperty().getId().equals(propertyId)) {
            throw new PropertyMediaNotFoundException();
        }

        // Update fields if provided
        if (sortOrder != null) {
            media.setSortOrder(sortOrder);
        }
        if (isCover != null) {
            // If setting this as cover, unset other covers for this property
            if (isCover) {
                var allMedia = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);
                allMedia.forEach(m -> {
                    if (!m.getId().equals(mediaId) && m.getIsCover()) {
                        m.setIsCover(false);
                        propertyMediaRepository.save(m);
                    }
                });
            }
            media.setIsCover(isCover);
        }

        return propertyMediaRepository.save(media);
    }

    public void deleteMedia(UUID agentId, UUID propertyId, UUID mediaId) {
        // Verify property exists and belongs to agent
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        // Find media
        PropertyMedia media = propertyMediaRepository.findById(mediaId)
                .orElseThrow(PropertyMediaNotFoundException::new);

        if (!media.getProperty().getId().equals(propertyId)) {
            throw new PropertyMediaNotFoundException();
        }

        propertyMediaRepository.delete(media);
    }
}


