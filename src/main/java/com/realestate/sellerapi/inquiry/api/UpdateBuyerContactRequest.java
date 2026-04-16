package com.realestate.sellerapi.inquiry.api;

public record UpdateBuyerContactRequest(
        String buyerEmail,
        String buyerPhone
) {
}

