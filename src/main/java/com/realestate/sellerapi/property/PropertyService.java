package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.api.CreatePropertyRequest;
import com.realestate.sellerapi.property.api.MarkSoldResponse;
import com.realestate.sellerapi.property.api.PaginatedPropertyResponse;
import com.realestate.sellerapi.property.api.PropertyResponse;
import com.realestate.sellerapi.property.api.PropertyStatusCountsResponse;
import com.realestate.sellerapi.property.api.PublishPropertyResponse;
import com.realestate.sellerapi.property.api.UpdatePropertyRequest;
import com.realestate.sellerapi.property.api.events.PropertyPublishedEvent;
import com.realestate.sellerapi.property.api.events.PropertySoldEvent;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyMedia;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import com.realestate.sellerapi.property.domain.PropertyType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);


    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PropertyService(PropertyRepository propertyRepository,
                           PropertyMediaRepository propertyMediaRepository,
                           ApplicationEventPublisher eventPublisher) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaRepository = propertyMediaRepository;
        this.eventPublisher = eventPublisher;
    }

    public PropertyResponse createProperty(UUID agentId, CreatePropertyRequest request) {
        Property property = Property.builder()
                .agentId(agentId)
                .title(request.title())
                .description(request.description())
                .pricePhp(request.pricePHP())
                .propertyType(PropertyType.valueOf(request.propertyType()))
                .bedrooms(request.bedrooms())
                .bathrooms(request.bathrooms())
                .floorAreaSqm(request.floorAreaSqm())
                .lotAreaSqm(request.lotAreaSqm())
                .region(request.address().region())
                .province(request.address().province())
                .cityMunicipality(request.address().cityMunicipality())
                .barangay(request.address().barangay())
                .postalCode(request.address().postalCode())
                .streetAddress(request.address().streetAddress())
                .latitude(request.geo() != null ? request.geo().latitude() : null)
                .longitude(request.geo() != null ? request.geo().longitude() : null)
                .status(PropertyStatus.DRAFT)
                .build();

        Property saved = propertyRepository.save(property);
        return toResponse(saved);
    }

    public PropertyResponse updateProperty(UUID agentId, UUID propertyId, UpdatePropertyRequest request) {
        Property property = findAgentProperty(agentId, propertyId);

        if (request.title() != null) property.setTitle(request.title());
        if (request.description() != null) property.setDescription(request.description());
        if (request.pricePHP() != null) property.setPricePhp(request.pricePHP());
        if (request.propertyType() != null) property.setPropertyType(PropertyType.valueOf(request.propertyType()));
        if (request.bedrooms() != null) property.setBedrooms(request.bedrooms());
        if (request.bathrooms() != null) property.setBathrooms(request.bathrooms());
        if (request.floorAreaSqm() != null) property.setFloorAreaSqm(request.floorAreaSqm());
        if (request.lotAreaSqm() != null) property.setLotAreaSqm(request.lotAreaSqm());

        if (request.address() != null) {
            if (request.address().region() != null) property.setRegion(request.address().region());
            if (request.address().province() != null) property.setProvince(request.address().province());
            if (request.address().cityMunicipality() != null) property.setCityMunicipality(request.address().cityMunicipality());
            if (request.address().barangay() != null) property.setBarangay(request.address().barangay());
            if (request.address().postalCode() != null) property.setPostalCode(request.address().postalCode());
            if (request.address().streetAddress() != null) property.setStreetAddress(request.address().streetAddress());
        }

        if (request.geo() != null) {
            if (request.geo().latitude() != null) property.setLatitude(request.geo().latitude());
            if (request.geo().longitude() != null) property.setLongitude(request.geo().longitude());
        }

        Property saved = propertyRepository.save(property);
        return toResponse(saved);
    }

    public PropertyResponse getAgentProperty(UUID agentId, UUID propertyId) {
        Property property = findAgentProperty(agentId, propertyId);
        return toResponse(property);
    }

    public void deleteProperty(UUID agentId, UUID propertyId) {
        Property property = findAgentProperty(agentId, propertyId);
        propertyRepository.delete(property);
    }

    public PublishPropertyResponse publishProperty(UUID agentId, UUID propertyId) {
        Property property = findAgentProperty(agentId, propertyId);

        if (property.getStatus() != PropertyStatus.DRAFT) {
            throw new InvalidPropertyStatusException("Can only publish DRAFT properties");
        }

        property.setStatus(PropertyStatus.PUBLISHED);
        property.setPublishedAt(Instant.now());
        Property saved = propertyRepository.save(property);

        eventPublisher.publishEvent(new PropertyPublishedEvent(saved.getId(), saved.getAgentId(), Instant.now()));

        return new PublishPropertyResponse(saved.getId(), saved.getStatus().name(), saved.getPublishedAt());
    }

    public MarkSoldResponse markSold(UUID agentId, UUID propertyId) {
        Property property = findAgentProperty(agentId, propertyId);

        if (property.getStatus() != PropertyStatus.PUBLISHED) {
            throw new InvalidPropertyStatusException("Can only mark PUBLISHED properties as sold");
        }

        property.setStatus(PropertyStatus.SOLD);
        property.setSoldAt(Instant.now());
        Property saved = propertyRepository.save(property);

        eventPublisher.publishEvent(new PropertySoldEvent(saved.getId(), saved.getAgentId(), Instant.now()));

        return new MarkSoldResponse(saved.getId(), saved.getStatus().name(), saved.getSoldAt());
    }

    public PaginatedPropertyResponse listAgentProperties(UUID agentId, String status, int page, int perPage) {
        List<Property> properties;

        if (status != null && !status.isEmpty()) {
            PropertyStatus statusEnum = PropertyStatus.valueOf(status.toUpperCase());
            properties = propertyRepository.findByAgentIdAndStatus(agentId, statusEnum);
        } else {
            properties = propertyRepository.findByAgentId(agentId);
        }

        int start = (page - 1) * perPage;
        int end = Math.min(start + perPage, properties.size());
        List<Property> pageContent = properties.subList(start, end);

        List<PaginatedPropertyResponse.PropertySummaryItem> items = pageContent.stream()
                .map(this::toSummaryItem)
                .collect(Collectors.toList());

        PaginatedPropertyResponse.MetaResponse meta = new PaginatedPropertyResponse.MetaResponse(
                page, perPage, properties.size()
        );

        return new PaginatedPropertyResponse(items, meta);
    }

    public PropertyStatusCountsResponse getAgentPropertyStatusCounts(UUID agentId) {
        long draft = propertyRepository.countByAgentIdAndStatus(agentId, PropertyStatus.DRAFT);
        long published = propertyRepository.countByAgentIdAndStatus(agentId, PropertyStatus.PUBLISHED);
        long sold = propertyRepository.countByAgentIdAndStatus(agentId, PropertyStatus.SOLD);
        long archived = propertyRepository.countByAgentIdAndStatus(agentId, PropertyStatus.ARCHIVED);
        long total = draft + published + sold + archived;
        return new PropertyStatusCountsResponse(draft, published, sold, archived, total);
    }

    private Property findAgentProperty(UUID agentId, UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (!property.getAgentId().equals(agentId)) {
            throw new PropertyNotOwnedException();
        }

        return property;
    }

    private PropertyResponse toResponse(Property property) {
        return new PropertyResponse(
                property.getId(),
                property.getTitle(),
                property.getDescription(),
                property.getPricePhp(),
                property.getStatus().name(),
                String.valueOf(property.getPropertyType()),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getFloorAreaSqm(),
                property.getLotAreaSqm(),
                new PropertyResponse.AddressResponse(
                        property.getRegion(),
                        property.getProvince(),
                        property.getCityMunicipality(),
                        property.getBarangay(),
                        property.getPostalCode(),
                        property.getStreetAddress()
                ),
                property.getLatitude() != null && property.getLongitude() != null ?
                        new PropertyResponse.GeoResponse(property.getLatitude(), property.getLongitude()) : null,
                property.getPublishedAt(),
                property.getSoldAt(),
                property.getCreatedAt(),
                property.getUpdatedAt()
        );
    }

    private PaginatedPropertyResponse.PropertySummaryItem toSummaryItem(Property property) {
        return new PaginatedPropertyResponse.PropertySummaryItem(
                property.getId().toString(),
                property.getTitle(),
                property.getStatus().name(),
                property.getPricePhp(),
                String.valueOf(property.getPropertyType()),
                property.getBedrooms(),
                property.getBathrooms(),
                new PaginatedPropertyResponse.PropertySummaryItem.AddressItem(
                        property.getCityMunicipality(),
                        property.getProvince()
                ),
                resolveCoverImageUrl(property.getId()),
                property.getSoldAt(),
                property.getCreatedAt()
        );
    }

    /**
     * Same rules as public listing cards: cover flag, else first image with a URL.
     */
    private String resolveCoverImageUrl(UUID propertyId) {
        List<PropertyMedia> media = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId);
        return media.stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsCover()) && m.getPublicUrl() != null && !m.getPublicUrl().isBlank())
                .map(PropertyMedia::getPublicUrl)
                .findFirst()
                .or(() -> media.stream()
                        .map(PropertyMedia::getPublicUrl)
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .findFirst())
                .orElse(null);
    }
}

