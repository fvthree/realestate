package com.realestate.sellerapi.property.api;

import com.realestate.sellerapi.property.PropertyMediaNotFoundException;
import com.realestate.sellerapi.property.PropertyMediaService;
import com.realestate.sellerapi.property.PropertyNotOwnedException;
import com.realestate.sellerapi.property.PropertyNotFoundException;
import com.realestate.sellerapi.security.AgentPrincipal;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/me/properties/{propertyId}/media")
public class PropertyMediaController {

    private static final Logger log = LoggerFactory.getLogger(PropertyMediaController.class);

    private final PropertyMediaService propertyMediaService;

    public PropertyMediaController(PropertyMediaService propertyMediaService) {
        this.propertyMediaService = propertyMediaService;
    }

    @PostMapping
    public ResponseEntity<?> addMedia(
            @PathVariable UUID propertyId,
            @RequestBody AddMediaRequest request) {
        log.info("Add media request: {}", request.toString());
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }

        try {
            var media = propertyMediaService.addMedia(principal.agentId(), propertyId, request.storageKey(), request.publicUrl());
            MediaResponse response = new MediaResponse(
                    media.getId(),
                    propertyId,
                    media.getPublicUrl(),
                    media.getSortOrder(),
                    media.getIsCover()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        }
    }

    @PatchMapping("/{mediaId}")
    public ResponseEntity<?> updateMedia(
            @PathVariable UUID propertyId,
            @PathVariable UUID mediaId,
            @RequestBody UpdateMediaRequest request) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }

        try {
            var media = propertyMediaService.updateMedia(principal.agentId(), propertyId, mediaId, request.sortOrder(), request.isCover());
            MediaResponse response = new MediaResponse(
                    media.getId(),
                    propertyId,
                    media.getPublicUrl(),
                    media.getSortOrder(),
                    media.getIsCover()
            );
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        } catch (PropertyMediaNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Media not found"));
        }
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<?> deleteMedia(
            @PathVariable UUID propertyId,
            @PathVariable UUID mediaId) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }

        try {
            propertyMediaService.deleteMedia(principal.agentId(), propertyId, mediaId);
            return ResponseEntity.noContent().build();
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        } catch (PropertyMediaNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Media not found"));
        }
    }
}

