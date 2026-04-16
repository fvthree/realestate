package com.realestate.sellerapi.property.api;

import java.util.Optional;
import java.util.UUID;

public interface PropertyAccess {

    Optional<PropertySummary> findPublishedProperty(UUID propertyId);
}

