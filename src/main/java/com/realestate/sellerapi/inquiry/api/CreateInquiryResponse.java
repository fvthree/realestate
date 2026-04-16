package com.realestate.sellerapi.inquiry.api;

import java.util.UUID;

public record CreateInquiryResponse(
        UUID inquiryId,
        String status,
        BuyerPortal buyerPortal
) {

    public record BuyerPortal(
            String inquiryUrl,
            String token
    ) {
    }
}

