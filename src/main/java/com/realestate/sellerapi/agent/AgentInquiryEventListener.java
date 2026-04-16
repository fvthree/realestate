package com.realestate.sellerapi.agent;

import com.realestate.sellerapi.inquiry.api.events.InquiryCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
class AgentInquiryEventListener {

    private static final Logger log = LoggerFactory.getLogger(AgentInquiryEventListener.class);

    @EventListener
    void onInquiryCreated(InquiryCreatedEvent event) {
        log.info("Inquiry created for property {} and agent {} (id={})",
                event.propertyId(), event.agentId(), event.inquiryId());
    }
}

