package com.realestate.sellerapi.inquiry.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PaginatedInquiryResponse(
        List<AgentInboxInquiryResponse> data,
        MetaResponse meta
) {
    public record MetaResponse(
            int page,
            @JsonProperty("per_page") int perPage,
            int total
    ) {}
}

