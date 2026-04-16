package com.realestate.sellerapi.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.resource.ResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.io.IOException;
import java.util.List;

/**
 * Serves {@code index.html} for paths that are not static files so client-side routing works.
 * REST APIs under {@code /api/**} are not handled here (controllers run first).
 */
final class SpaFallbackResourceResolver implements ResourceResolver {

    @Override
    @Nullable
    public Resource resolveResource(HttpServletRequest request, String requestPath,
                                    List<? extends Resource> locations, ResourceResolverChain chain) {
        Resource resource = chain.resolveResource(request, requestPath, locations);
        if (resource != null) {
            return resource;
        }
        if (requestPath.startsWith("api/")) {
            return null;
        }
        for (Resource location : locations) {
            try {
                Resource index = location.createRelative("index.html");
                if (index.exists() && index.isReadable()) {
                    return index;
                }
            } catch (IOException ignored) {
                // try next location
            }
        }
        return null;
    }

    @Override
    @Nullable
    public String resolveUrlPath(String resourcePath, List<? extends Resource> locations,
                                 ResourceResolverChain chain) {
        return chain.resolveUrlPath(resourcePath, locations);
    }
}
