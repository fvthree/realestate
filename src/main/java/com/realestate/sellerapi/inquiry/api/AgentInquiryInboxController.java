package com.realestate.sellerapi.inquiry.api;

import com.realestate.sellerapi.inquiry.InquiryNotFoundException;
import com.realestate.sellerapi.inquiry.InquiryService;
import com.realestate.sellerapi.security.AgentPrincipal;
import com.realestate.sellerapi.shared.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
@RequestMapping("/api/me/inquiries")
public class AgentInquiryInboxController {

    private final InquiryService inquiryService;

    public AgentInquiryInboxController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @GetMapping
    public ResponseEntity<?> listInquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID propertyId,
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

        PaginatedInquiryResponse response = inquiryService.listAgentInquiries(
                principal.agentId(), status, propertyId, page, perPage);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateInquiryStatusRequest request) {

        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }

        try {
            AgentInboxInquiryResponse response = inquiryService.updateInquiryStatus(
                    principal.agentId(), id, request);
            return ResponseEntity.ok(response);
        } catch (InquiryNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Inquiry not found"));
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable UUID id,
            @RequestBody AddMessageRequest request) {

        AgentPrincipal principal = (AgentPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(401, "Unauthorized"));
        }

        try {
            MessageResponse response = inquiryService.addAgentMessage(principal.agentId(), id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InquiryNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Inquiry not found"));
        }
    }
}
