package com.realestate.sellerapi.property.api;

/**
 * Totals for the authenticated agent's properties, grouped by status.
 */
public record PropertyStatusCountsResponse(
        long draft,
        long published,
        long sold,
        long archived,
        long total
) {
}
