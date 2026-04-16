package com.realestate.sellerapi.property.api;

import java.util.UUID;

public record AddMediaRequest(
        String mediaType,
        String storageKey,
        String publicUrl
) {
}

