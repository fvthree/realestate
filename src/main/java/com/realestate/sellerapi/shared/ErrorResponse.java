package com.realestate.sellerapi.shared;

public record ErrorResponse(
        int status,
        String message
) {
}

