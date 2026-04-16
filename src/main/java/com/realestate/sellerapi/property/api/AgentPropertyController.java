package com.realestate.sellerapi.property.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.sellerapi.property.InvalidPropertyStatusException;
import com.realestate.sellerapi.property.PropertyNotOwnedException;
import com.realestate.sellerapi.property.PropertyNotFoundException;
import com.realestate.sellerapi.property.PropertyService;
import com.realestate.sellerapi.security.AgentPrincipal;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/me/properties")
public class AgentPropertyController {

    private static final Logger log = LoggerFactory.getLogger(AgentPropertyController.class);

    private final PropertyService propertyService;

    private final ObjectMapper objectMapper;

    public AgentPropertyController(PropertyService propertyService, ObjectMapper objectMapper) {
        this.propertyService = propertyService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<?> createProperty(
            @RequestBody CreatePropertyRequest request) {
        try {

        log.info("Create property request: {}", objectMapper.writeValueAsString(request));

        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
            PropertyResponse response = propertyService.createProperty(principal.agentId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Failed to create property"));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateProperty(
            @PathVariable UUID id,
            @RequestBody UpdatePropertyRequest request) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            PropertyResponse response = propertyService.updateProperty(principal.agentId(), id, request);
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable UUID id) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            PropertyResponse response = propertyService.getAgentProperty(principal.agentId(), id);
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(
            @PathVariable UUID id) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            propertyService.deleteProperty(principal.agentId(), id);
            return ResponseEntity.noContent().build();
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishProperty(
            @PathVariable UUID id) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            PublishPropertyResponse response = propertyService.publishProperty(principal.agentId(), id);
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        } catch (InvalidPropertyStatusException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, ex.getMessage()));
        }
    }

    @PostMapping("/{id}/mark-sold")
    public ResponseEntity<?> markSold(
            @PathVariable UUID id) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        try {
            MarkSoldResponse response = propertyService.markSold(principal.agentId(), id);
            return ResponseEntity.ok(response);
        } catch (PropertyNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Property not found"));
        } catch (PropertyNotOwnedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(403, "You do not own this property"));
        } catch (InvalidPropertyStatusException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> listProperties(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20", name = "per_page") int perPage) {
        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }
        if (perPage > 100) {
            perPage = 100;
        }
        try {
            PaginatedPropertyResponse response = propertyService.listAgentProperties(
                    principal.agentId(), status, page, perPage);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, "Invalid query parameters"));
        }
    }
}
