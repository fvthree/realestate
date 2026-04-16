package com.realestate.sellerapi.property;

import com.realestate.sellerapi.property.domain.Property;
import com.realestate.sellerapi.property.domain.PropertyMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

/**
 * Repository for PropertyMedia entity.
 * Package-private - only accessible within the property module.
 */
interface PropertyMediaRepository extends JpaRepository<PropertyMedia, UUID> {

    List<PropertyMedia> findByPropertyOrderBySortOrderAsc(Property property);

    @Query("SELECT m FROM PropertyMedia m WHERE m.property.id = :propertyId ORDER BY m.sortOrder ASC")
    List<PropertyMedia> findByPropertyIdOrderBySortOrderAsc(@Param("propertyId") UUID propertyId);
}

