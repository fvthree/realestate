package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.api.PaginatedPropertyResponse;
import com.realestate.sellerapi.property.api.PublicPropertyDetailResponse;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import com.realestate.sellerapi.property.domain.PropertyMedia;

@Service
public class PropertyPublicService {

    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;
    private final AgentPublicProvider agentPublicProvider;

    public PropertyPublicService(PropertyRepository propertyRepository,
                                PropertyMediaRepository propertyMediaRepository,
                                AgentPublicProvider agentPublicProvider) {
        this.propertyRepository = propertyRepository;
        this.propertyMediaRepository = propertyMediaRepository;
        this.agentPublicProvider = agentPublicProvider;
    }

    public PaginatedPropertyResponse listPublishedProperties(
            String city, String province, BigDecimal minPrice, BigDecimal maxPrice,
            String propertyType, Integer bedrooms, int page, int perPage) {

        List<Property> published = propertyRepository.findByStatus(PropertyStatus.PUBLISHED);

        // Filter by city
        if (city != null && !city.isEmpty()) {
            published = published.stream()
                    .filter(p -> city.equalsIgnoreCase(p.getCityMunicipality()))
                    .collect(Collectors.toList());
        }

        // Filter by province
        if (province != null && !province.isEmpty()) {
            published = published.stream()
                    .filter(p -> province.equalsIgnoreCase(p.getProvince()))
                    .collect(Collectors.toList());
        }

        // Filter by price range
        if (minPrice != null) {
            published = published.stream()
                    .filter(p -> p.getPricePhp().compareTo(minPrice) >= 0)
                    .collect(Collectors.toList());
        }
        if (maxPrice != null) {
            published = published.stream()
                    .filter(p -> p.getPricePhp().compareTo(maxPrice) <= 0)
                    .collect(Collectors.toList());
        }

        // Filter by property type
        if (propertyType != null && !propertyType.isEmpty()) {
            published = published.stream()
                    .filter(p -> propertyType.equalsIgnoreCase(String.valueOf(p.getPropertyType())))
                    .collect(Collectors.toList());
        }

        // Filter by bedrooms
        if (bedrooms != null) {
            published = published.stream()
                    .filter(p -> p.getBedrooms() != null && p.getBedrooms().equals(bedrooms))
                    .collect(Collectors.toList());
        }

        int start = (page - 1) * perPage;
        int end = Math.min(start + perPage, published.size());
        List<Property> pageContent = published.subList(start, end);

        List<PaginatedPropertyResponse.PropertySummaryItem> items = pageContent.stream()
                .map(p -> toSummaryItem(p))
                .collect(Collectors.toList());

        PaginatedPropertyResponse.MetaResponse meta = new PaginatedPropertyResponse.MetaResponse(
                page, perPage, published.size()
        );

        return new PaginatedPropertyResponse(items, meta);
    }

    public PublicPropertyDetailResponse getPropertyDetail(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(PropertyNotFoundException::new);

        if (property.getStatus() != PropertyStatus.PUBLISHED) {
            throw new PropertyNotFoundException();
        }

        var agent = agentPublicProvider.getAgentPublic(property.getAgentId());

        var media = propertyMediaRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                .stream()
                .map(m -> new PublicPropertyDetailResponse.MediaDetail(
                        m.getId(),
                        m.getPublicUrl(),
                        m.getSortOrder(),
                        m.getIsCover()
                ))
                .collect(Collectors.toList());

        return new PublicPropertyDetailResponse(
                property.getId(),
                property.getTitle(),
                property.getDescription(),
                property.getPricePhp(),
                property.getStatus().name(),
                String.valueOf(property.getPropertyType()),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getFloorAreaSqm(),
                new PublicPropertyDetailResponse.AddressDetail(
                        property.getRegion(),
                        property.getProvince(),
                        property.getCityMunicipality(),
                        property.getBarangay(),
                        property.getPostalCode(),
                        property.getStreetAddress()
                ),
                property.getLatitude() != null && property.getLongitude() != null ?
                        new PublicPropertyDetailResponse.GeoDetail(
                                property.getLatitude(),
                                property.getLongitude()
                        ) : null,
                media,
                agent != null ?
                        new PublicPropertyDetailResponse.AgentDetail(
                                agent.name(),
                                agent.phone(),
                                agent.avatarUrl()
                        ) : null
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
     * Cover image for list cards: explicit cover flag, else first image with a public URL.
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


