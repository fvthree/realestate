package com.realestate.sellerapi.inquiry.api;

public record CreateInquiryRequest(
        String buyerName,
        String buyerEmail,
        String buyerPhone,
        String message
) {
}

