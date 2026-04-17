package com.realestate.sellerapi.inquiry;

import com.realestate.sellerapi.inquiry.api.*;
import com.realestate.sellerapi.inquiry.api.events.InquiryCreatedEvent;
import com.realestate.sellerapi.inquiry.domain.ConversationMessage;
import com.realestate.sellerapi.inquiry.domain.Inquiry;
import com.realestate.sellerapi.inquiry.domain.InquiryStatus;
import com.realestate.sellerapi.inquiry.domain.SenderType;
import com.realestate.sellerapi.property.PropertyMediaRepository;
import com.realestate.sellerapi.property.PropertyRepository;
import com.realestate.sellerapi.property.api.PropertyAccess;
import com.realestate.sellerapi.property.api.PropertySummary;
import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyMedia;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InquiryService {

    private static final Logger log = LoggerFactory.getLogger(InquiryService.class);

    private final InquiryRepository inquiryRepository;
    private final PropertyAccess propertyAccess;
    private final PropertyRepository propertyRepository;
    private final PropertyMediaRepository propertyMediaRepository;
    private final ApplicationEventPublisher eventPublisher;

    InquiryService(InquiryRepository inquiryRepository,
                   PropertyAccess propertyAccess,
                   PropertyRepository propertyRepository,
                   PropertyMediaRepository propertyMediaRepository,
                   ApplicationEventPublisher eventPublisher) {
        this.inquiryRepository = inquiryRepository;
        this.propertyAccess = propertyAccess;
        this.propertyRepository = propertyRepository;
        this.propertyMediaRepository = propertyMediaRepository;
        this.eventPublisher = eventPublisher;
    }



    public CreateInquiryResponse createInquiry(UUID propertyId, CreateInquiryRequest request) {
        Optional<PropertySummary> property = propertyAccess.findPublishedProperty(propertyId);
        if (property.isEmpty()) {
            throw new IllegalArgumentException("Property not found or not published");
        }

        String token = UUID.randomUUID().toString();
        log.info("[inquiry-token] token = [{}]", token);

        String tokenHash = TokenHasher.sha256(token);

        Inquiry inquiry = Inquiry.builder()
                .propertyId(propertyId)
                .agentId(property.get().agentId())
                .buyerName(request.buyerName())
                .buyerEmail(request.buyerEmail())
                .buyerPhone(request.buyerPhone())
                .initialMessage(request.message())
                .accessTokenHash(tokenHash)
                .build();

        ConversationMessage firstMessage = ConversationMessage.builder()
                .senderType(SenderType.BUYER)
                .body(request.message())
                .build();

        inquiry.addMessage(firstMessage);

        Inquiry saved = inquiryRepository.save(inquiry);

        eventPublisher.publishEvent(new InquiryCreatedEvent(
                saved.getId(),
                saved.getPropertyId(),
                saved.getAgentId(),
                Instant.now()
        ));

        return new CreateInquiryResponse(
                saved.getId(),
                saved.getStatus().name(),
                new CreateInquiryResponse.BuyerPortal(
                        "/api/public/inquiries/" + saved.getId(),
                        token
                )
        );
    }

    // Buyer Portal Methods
    public BuyerInquiryDetailResponse getBuyerInquiry(UUID inquiryId, String token) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        String tokenHash = TokenHasher.sha256(token);
        if (!inquiry.getAccessTokenHash().equals(tokenHash)) {
            throw new InvalidTokenException();
        }

        return toBuyerDetailResponse(inquiry);
    }

    public BuyerInquiryDetailResponse updateBuyerContact(UUID inquiryId, String token, UpdateBuyerContactRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        String tokenHash = TokenHasher.sha256(token);
        if (!inquiry.getAccessTokenHash().equals(tokenHash)) {
            throw new InvalidTokenException();
        }

        if (request.buyerEmail() != null) {
            inquiry.setBuyerEmail(request.buyerEmail());
        }
        if (request.buyerPhone() != null) {
            inquiry.setBuyerPhone(request.buyerPhone());
        }

        Inquiry saved = inquiryRepository.save(inquiry);
        return toBuyerDetailResponse(saved);
    }

    public MessageResponse addBuyerMessage(UUID inquiryId, String token, AddMessageRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        String tokenHash = TokenHasher.sha256(token);
        if (!inquiry.getAccessTokenHash().equals(tokenHash)) {
            throw new InvalidTokenException();
        }

        ConversationMessage message = ConversationMessage.builder()
                .senderType(SenderType.BUYER)
                .body(request.body())
                .build();

        inquiry.addMessage(message);
        inquiryRepository.save(inquiry);

        return new MessageResponse(
                message.getId(),
                message.getSenderType().name(),
                message.getBody(),
                message.getCreatedAt()
        );
    }

    // Agent Inbox Methods
    public PaginatedInquiryResponse listAgentInquiries(UUID agentId, String status, UUID propertyId, int page, int perPage) {
        List<Inquiry> inquiries = inquiryRepository.findByAgentId(agentId);

        if (status != null && !status.isEmpty()) {
            InquiryStatus statusEnum = InquiryStatus.valueOf(status.toUpperCase());
            inquiries = inquiries.stream()
                    .filter(i -> i.getStatus() == statusEnum)
                    .collect(Collectors.toList());
        }

        if (propertyId != null) {
            inquiries = inquiries.stream()
                    .filter(i -> i.getPropertyId().equals(propertyId))
                    .collect(Collectors.toList());
        }

        int start = (page - 1) * perPage;
        int end = Math.min(start + perPage, inquiries.size());
        List<Inquiry> pageContent = inquiries.subList(start, end);

        List<AgentInboxInquiryResponse> items = pageContent.stream()
                .map(this::toAgentInboxResponse)
                .collect(Collectors.toList());

        PaginatedInquiryResponse.MetaResponse meta = new PaginatedInquiryResponse.MetaResponse(
                page, perPage, inquiries.size()
        );

        return new PaginatedInquiryResponse(items, meta);
    }

    @Transactional(readOnly = true)
    public AgentInquiryDetailResponse getAgentInquiryDetail(UUID agentId, UUID inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        if (!inquiry.getAgentId().equals(agentId)) {
            throw new InquiryNotFoundException();
        }

        String propertyTitle = null;
        String coverImageUrl = null;
        java.math.BigDecimal pricePHP = null;
        String propertyType = null;
        Integer bedrooms = null;
        Integer bathrooms = null;
        String cityMunicipality = null;
        String province = null;
        Optional<Property> propertyOpt = propertyRepository.findById(inquiry.getPropertyId());
        if (propertyOpt.isPresent()) {
            Property p = propertyOpt.get();
            propertyTitle = p.getTitle();
            coverImageUrl = resolveCoverImageUrl(p.getId());
            pricePHP = p.getPricePhp();
            propertyType = p.getPropertyType() != null ? p.getPropertyType().name() : null;
            bedrooms = p.getBedrooms();
            bathrooms = p.getBathrooms();
            cityMunicipality = p.getCityMunicipality();
            province = p.getProvince();
        }

        List<AgentInquiryDetailResponse.MessageInfo> messages = inquiry.getMessages().stream()
                .map(m -> new AgentInquiryDetailResponse.MessageInfo(
                        m.getId(),
                        m.getSenderType().name(),
                        m.getBody(),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new AgentInquiryDetailResponse(
                inquiry.getId(),
                inquiry.getPropertyId(),
                inquiry.getStatus().name(),
                propertyTitle,
                coverImageUrl,
                pricePHP,
                propertyType,
                bedrooms,
                bathrooms,
                cityMunicipality,
                province,
                inquiry.getBuyerName(),
                inquiry.getBuyerEmail(),
                inquiry.getBuyerPhone(),
                messages
        );
    }

    public AgentInboxInquiryResponse updateInquiryStatus(UUID agentId, UUID inquiryId, UpdateInquiryStatusRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        if (!inquiry.getAgentId().equals(agentId)) {
            throw new InquiryNotFoundException();
        }

        InquiryStatus newStatus = InquiryStatus.valueOf(request.status().toUpperCase());
        inquiry.setStatus(newStatus);
        inquiry.setLastContactedAt(Instant.now());

        Inquiry saved = inquiryRepository.save(inquiry);
        return toAgentInboxResponse(saved);
    }

    public MessageResponse addAgentMessage(UUID agentId, UUID inquiryId, AddMessageRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(InquiryNotFoundException::new);

        if (!inquiry.getAgentId().equals(agentId)) {
            throw new InquiryNotFoundException();
        }

        ConversationMessage message = ConversationMessage.builder()
                .senderType(SenderType.AGENT)
                .body(request.body())
                .build();

        inquiry.addMessage(message);
        inquiryRepository.save(inquiry);

        return new MessageResponse(
                message.getId(),
                message.getSenderType().name(),
                message.getBody(),
                message.getCreatedAt()
        );
    }

    // Helpers
    private BuyerInquiryDetailResponse toBuyerDetailResponse(Inquiry inquiry) {
        List<BuyerInquiryDetailResponse.MessageInfo> messages = inquiry.getMessages().stream()
                .map(m -> new BuyerInquiryDetailResponse.MessageInfo(
                        m.getId(),
                        m.getSenderType().name(),
                        m.getBody(),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new BuyerInquiryDetailResponse(
                inquiry.getId(),
                inquiry.getPropertyId(),
                inquiry.getStatus().name(),
                new BuyerInquiryDetailResponse.BuyerInfo(
                        inquiry.getBuyerName(),
                        inquiry.getBuyerEmail(),
                        inquiry.getBuyerPhone()
                ),
                messages
        );
    }

    private AgentInboxInquiryResponse toAgentInboxResponse(Inquiry inquiry) {
        String propertyTitle = null;
        String coverImageUrl = null;
        Optional<Property> propertyOpt = propertyRepository.findById(inquiry.getPropertyId());
        if (propertyOpt.isPresent()) {
            Property p = propertyOpt.get();
            propertyTitle = p.getTitle();
            coverImageUrl = resolveCoverImageUrl(p.getId());
        }
        return new AgentInboxInquiryResponse(
                inquiry.getId(),
                inquiry.getPropertyId(),
                inquiry.getStatus().name(),
                inquiry.getBuyerName(),
                inquiry.getBuyerEmail(),
                inquiry.getBuyerPhone(),
                inquiry.getCreatedAt(),
                propertyTitle,
                coverImageUrl
        );
    }

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
